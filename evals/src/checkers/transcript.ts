/** A tool call as the `stream-json` transcript reports it. */
export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

/** Every tool call in a `stream-json` transcript, in order. */
export function parseTranscript(raw: string): ToolCall[] {
  const calls: ToolCall[] = [];

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') {
      continue;
    }

    let event: unknown;
    try {
      event = JSON.parse(trimmed);
    } catch {
      // A truncated final line is expected when a run is interrupted.
      continue;
    }

    for (const block of contentBlocks(event)) {
      if (
        typeof block === 'object' &&
        block !== null &&
        'type' in block &&
        block.type === 'tool_use' &&
        'name' in block &&
        typeof block.name === 'string'
      ) {
        const input = 'input' in block ? block.input : undefined;
        calls.push({
          name: block.name,
          input: typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {},
        });
      }
    }
  }

  return calls;
}

function contentBlocks(event: unknown): unknown[] {
  if (typeof event !== 'object' || event === null || !('message' in event)) {
    return [];
  }

  const message = event.message;
  if (typeof message !== 'object' || message === null || !('content' in message)) {
    return [];
  }

  return Array.isArray(message.content) ? message.content : [];
}

/** The shell command a Bash tool call ran, or undefined for other tools. */
export function bashCommand(call: ToolCall): string | undefined {
  if (call.name !== 'Bash') {
    return undefined;
  }

  const command = call.input.command;

  return typeof command === 'string' ? command : undefined;
}

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);

/** The file an edit-shaped tool call targeted, or undefined. */
export function editedPath(call: ToolCall): string | undefined {
  if (!EDIT_TOOLS.has(call.name)) {
    return undefined;
  }

  const path = call.input.file_path ?? call.input.path;

  return typeof path === 'string' ? path : undefined;
}
