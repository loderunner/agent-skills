import type { Node } from 'web-tree-sitter';
import type { Unit } from './ast.js';

/**
 * Matches `if err != nil` in both its forms, with and without an initializer.
 *
 * An identifier comparison, so `if resp.Err != nil` and `if errors.Is(...)`
 * stay out: the skill's rule is about the plain guard.
 */
export const ERROR_GUARD_QUERY = `
(if_statement
  condition: (binary_expression
    left: (identifier) @errvar
    operator: "!="
    right: (nil))) @unit
`;

/** Without type information, whether a variable holds an error is a naming question. */
export function looksLikeError(name: string): boolean {
  return /err/i.test(name);
}

/** Error guards only, from a unit list produced by `ERROR_GUARD_QUERY`. */
export function isErrorGuard(unit: Unit): boolean {
  const errvar = unit.captures.errvar;

  return errvar !== undefined && looksLikeError(errvar.text);
}

/**
 * The statement that produced the error: the guard's own initializer when it
 * has one, otherwise the statement immediately before it.
 */
export function acquireStatement(guard: Node): Node | null {
  return guard.childForFieldName('initializer') ?? guard.previousNamedSibling;
}

/** True when the node sits inside a `defer`, where a discarded error is conventional. */
export function insideDefer(node: Node): boolean {
  for (let current = node.parent; current !== null; current = current.parent) {
    if (current.type === 'defer_statement') {
      return true;
    }

    if (current.type === 'function_declaration' || current.type === 'method_declaration') {
      return false;
    }
  }

  return false;
}

/**
 * True when the node sits inside the body of an `if err != nil` block.
 *
 * Best-effort cleanup on an already-failing path is not a discarded error in
 * the sense the skill means, and a function returns one error, so handling the
 * cleanup error there would conflict with the rule under test.
 */
export function insideErrorGuardBody(node: Node): boolean {
  for (let current = node.parent; current !== null; current = current.parent) {
    if (current.type === 'function_declaration' || current.type === 'method_declaration') {
      return false;
    }

    if (current.type !== 'block') {
      continue;
    }

    const guard = current.parent;
    if (guard === null || guard.type !== 'if_statement') {
      continue;
    }

    if (guard.childForFieldName('consequence')?.equals(current) !== true) {
      continue;
    }

    const condition = guard.childForFieldName('condition');
    if (
      condition?.type !== 'binary_expression' ||
      condition.childForFieldName('operator')?.text !== '!=' ||
      condition.childForFieldName('right')?.type !== 'nil'
    ) {
      continue;
    }

    const left = condition.childForFieldName('left');
    if (left?.type === 'identifier' && looksLikeError(left.text)) {
      return true;
    }
  }

  return false;
}

/**
 * Methods whose standard-library signature returns an error as its last result,
 * and which are common knowledge rather than a guess.
 *
 * Deliberately excluded as ambiguous without type information: `Wait`
 * (`wg.Wait()` returns nothing, `cmd.Wait()` returns an error), and plain setters.
 */
export const ERROR_RETURNING_METHODS: ReadonlySet<string> = new Set([
  'Close', 'Decode', 'Encode', 'Exec', 'Flush', 'Scan', 'Sync', 'Unmarshal',
  'Write', 'WriteByte', 'WriteString',
]);

/** The callee's final name segment: `Write` for both `w.Write` and `bufio.NewWriter(w).Write`. */
export function calleeLeaf(call: Node): string | undefined {
  const fn = call.childForFieldName('function');
  if (fn === null) {
    return undefined;
  }

  if (fn.type === 'selector_expression') {
    return fn.childForFieldName('field')?.text;
  }

  return fn.type === 'identifier' ? fn.text : undefined;
}

/** Go's predeclared type names. `string(b)` and `int64(n)` parse as `call_expression`. */
export const GO_PREDECLARED_TYPES: ReadonlySet<string> = new Set([
  'any', 'bool', 'byte', 'complex64', 'complex128', 'error', 'float32',
  'float64', 'int', 'int8', 'int16', 'int32', 'int64', 'rune', 'string',
  'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uintptr',
]);

/** Go's predeclared functions, which the skill's examples do not treat as calls. */
export const GO_BUILTIN_FUNCS: ReadonlySet<string> = new Set([
  'append', 'cap', 'clear', 'close', 'complex', 'copy', 'delete', 'imag',
  'len', 'make', 'max', 'min', 'new', 'panic', 'print', 'println', 'real',
  'recover',
]);

function calleeName(call: Node): string | undefined {
  return call.childForFieldName('function')?.text;
}

/**
 * True for a conversion to a predeclared type.
 *
 * A conversion to a user-defined type (`MyID(x)`) is indistinguishable from a
 * call without type information, and is counted as a call.
 */
export function isTypeConversion(call: Node): boolean {
  const name = calleeName(call);

  return name !== undefined && GO_PREDECLARED_TYPES.has(name);
}

export function isBuiltinCall(call: Node): boolean {
  const name = calleeName(call);

  return name !== undefined && GO_BUILTIN_FUNCS.has(name);
}

/** Calls to real functions, excluding type conversions and builtins. */
export function functionCallsIn(node: Node): Node[] {
  return node
    .descendantsOfType('call_expression')
    .filter((call) => !isTypeConversion(call) && !isBuiltinCall(call));
}
