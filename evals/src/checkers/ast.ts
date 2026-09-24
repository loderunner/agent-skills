import { createRequire } from 'node:module';
import { Language, Parser, Query, type Node, type Tree } from 'web-tree-sitter';

const require = createRequire(import.meta.url);
const GRAMMAR = require.resolve('tree-sitter-go/tree-sitter-go.wasm');

/** Files this bench can parse. Everything else in an artifact is ignored. */
export const EXTENSION = '.go';

let language: Promise<Language> | undefined;

async function grammar(): Promise<Language> {
  language ??= Parser.init().then(() => Language.load(GRAMMAR));

  return language;
}

export interface ParsedFile {
  /** Path as the artifact reports it, used in failure messages. */
  path: string;
  source: string;
  /** Split once, for the rules that read raw layout. */
  lines: readonly string[];
  tree: Tree;
  /** Tree-sitter recovers from syntax errors, so a broken file still yields matches. */
  hasError: boolean;
}

export async function parseFile(path: string, source: string): Promise<ParsedFile> {
  // The grammar is awaited first: `new Parser()` throws before `Parser.init()`.
  const language = await grammar();
  const parser = new Parser();
  parser.setLanguage(language);

  const tree = parser.parse(source);
  if (tree === null) {
    throw new Error(`failed to parse ${path}`);
  }

  return { path, source, lines: source.split('\n'), tree, hasError: tree.rootNode.hasError };
}

/** One thing to judge: an `if` statement, an error guard, a bare call. */
export interface Unit {
  file: string;
  /** 1-based, so it pairs with `file` as a clickable `file:line`. */
  line: number;
  node: Node;
  /** Every named capture in the match, so a case can reach the parts it cares about. */
  captures: Record<string, Node>;
  /** The unit's own source with comments removed. */
  snippet: string;
  /** The containing file's lines, for rules that read raw layout. */
  lines: readonly string[];
}

const compiled = new Map<string, Query>();

/**
 * Run a tree-sitter query over every file and return one unit per match. The
 * `@unit` capture names the node under judgment.
 */
export async function enumerate(
  files: readonly ParsedFile[],
  querySource: string,
): Promise<Unit[]> {
  const language = await grammar();

  let query = compiled.get(querySource);
  if (query === undefined) {
    query = new Query(language, querySource);
    compiled.set(querySource, query);
  }

  return files.flatMap((file) =>
    query.matches(file.tree.rootNode).map((match) => {
      const captures: Record<string, Node> = {};
      for (const capture of match.captures) {
        captures[capture.name] ??= capture.node;
      }

      const node = captures.unit;
      if (node === undefined) {
        throw new Error(`query has no @unit capture: ${querySource}`);
      }

      return {
        file: file.path,
        line: node.startPosition.row + 1,
        node,
        captures,
        snippet: stripComments(node),
        lines: file.lines,
      };
    }),
  );
}

/**
 * The node's source with comments removed.
 *
 * The model under test writes the comments, so a with-skill run could otherwise
 * address the grader directly in only one arm.
 */
export function stripComments(node: Node): string {
  let text = node.text;

  // Back to front, so earlier offsets stay valid.
  for (const comment of node.descendantsOfType('comment').reverse()) {
    text =
      text.slice(0, comment.startIndex - node.startIndex) +
      text.slice(comment.endIndex - node.startIndex);
  }

  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
}

/**
 * The next sibling that is actual code.
 *
 * Comments are named nodes, so `nextNamedSibling` would let the model under test
 * change the structure the grader sees just by writing one.
 */
export function nextStatement(node: Node): Node | null {
  let sibling = node.nextNamedSibling;
  while (sibling !== null && sibling.type === 'comment') {
    sibling = sibling.nextNamedSibling;
  }

  return sibling;
}

/** True when no code follows the node in its enclosing block. */
export function isLastInScope(node: Node): boolean {
  return nextStatement(node) === null;
}

/**
 * True when the line after the node's last line is empty.
 *
 * Read from raw source, so a comment there is not a blank line — a comment can
 * only make this stricter, never turn a violation into a pass.
 */
export function blankLineAfter(unit: Unit): boolean {
  const next = unit.lines[unit.node.endPosition.row + 1];

  return next !== undefined && next.trim() === '';
}
