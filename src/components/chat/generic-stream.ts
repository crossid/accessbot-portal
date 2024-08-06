import { AIStream, AIStreamParser, OpenAIStreamCallbacks } from 'ai';

type OP = {
  op: 'add';
  path: string;
  value: string;
};

type OPS = OP[];

type Payload = {
  ops: OPS;
};

function parseStreamLangServe(): AIStreamParser {
  return (data) => {
    const payload = JSON.parse(data) as Payload;
    const ops = payload.ops;
    if (ops.length === 0) return '';
    const op = ops[0];
    if (op.op === 'add' && op.path === '/streamed_output/-') {
      return op.value;
    }
  };
}

// EventData is the type of the data that comes from the backend
type EventData = {
  // e.g., "Information", "Recommender", "DataOwner" for agents or
  // "find_app", "recommend_access", "request_access", "get_relevant_data" for tools
  name: string;
  // a string token or a JSON string with the inputs/outputs of the tool
  content: string;
};

export type ToolMode = 'inputs' | 'outputs';

//  StreamEntry is the type of the data that is sent to the frontend
export type StreamEntry = {
  type: 'tool' | 'content';
  name: string;
  content: string | ToolContent;
};

export type ToolContent = {
  mode: ToolMode;
  content: object;
};

function parseStreamBackend(): AIStreamParser {
  return (data, event) => {
    const edata = JSON.parse(data) as EventData;
    // console.log(edata, event)
    if (event.event === 'start-tool' || event.event === 'end-tool') {
      const content = JSON.parse(edata.content);
      const mode: ToolMode = content.inputs ? 'inputs' : 'outputs';
      const toolEntry: StreamEntry = {
        type: 'tool',
        name: edata.name,
        content: {
          mode,
          content
        }
      };

      return JSON.stringify(toolEntry);
    }

    return JSON.stringify({
      type: 'content',
      name: edata.name,
      content: edata.content
    });
  };
}

export function GenericStream(
  res: Response,
  cb?: OpenAIStreamCallbacks
): ReadableStream {
  return AIStream(res, parseStreamBackend(), cb);
}
