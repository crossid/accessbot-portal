import { StatusError } from '@/lib/types';
import {
  GenericStream,
  StreamEntry,
  ToolContent,
  ToolMode
} from './generic-stream';

/**
 * Consumes a ReadableStream until it is done.
 * @param stream The ReadableStream to consume.
 */
const consumeStream = async (stream: ReadableStream) => {
  const reader = stream.getReader();
  while (true) {
    const { done } = await reader.read();
    if (done) break;
  }
};

/**
 * Runs the AI completion process.
 *
 * @returns An object with a callback function to handle text content.
 */
export function runAICompletion(url: string, init: RequestInit) {
  let accumulatedTokens = '';
  let text = '';

  let onTextContent: (text: string, isFinal: boolean) => void = () => {};
  let onFuncCall: (
    name: string,
    mode: ToolMode,
    content: ToolContent
  ) => void = () => {};
  let onError: (error: Error) => void = () => {};

  (async () => {
    const resp = await fetch(url, init);
    if (resp.status !== 200) {
      const json = await resp.json();
      onError(new StatusError(resp.status, json));
      return;
    }
    consumeStream(
      GenericStream(resp, {
        onStart: async () => {
          console.log('Stream started');
        },
        onCompletion: async (completion) => {
          console.log('Completion completed: ', completion);
        },
        onFinal: async (completion) => {
          onTextContent(text, true);
        },
        onToken: async (token) => {
          const tokenObj = JSON.parse(token) as StreamEntry;
          if (tokenObj.type === 'tool') {
            const content = tokenObj.content as ToolContent;
            onFuncCall(
              tokenObj.name,
              content.mode,
              content.content as ToolContent
            );
            return;
          } else if (tokenObj.type === 'content') {
            if (
              tokenObj.name !== "Information" &&
              tokenObj.name !== "DataOwner" &&
              tokenObj.name !== "guardrail"
            ) {
              console.debug('Ignoring content token: ', tokenObj);
              return;
            }

            // TODO: there is a special case where the agent returns "Recommender" split to tokens "Re" "comm" "ender" as a content and we don't want to print it
            if (
              (tokenObj.name === 'Information' ||
                tokenObj.name === 'DataOwner') &&
              ((accumulatedTokens === '' && tokenObj.content === 'Re') ||
                (accumulatedTokens === 'Re' && tokenObj.content === 'comm') ||
                (accumulatedTokens === 'Recomm' &&
                  tokenObj.content === 'ender'))
            ) {
              accumulatedTokens += tokenObj.content;
              return;
            } else {
              accumulatedTokens = '';
              text += tokenObj.content;
              onTextContent(text, false);
            }
          }
        }
      })
    );
  })();

  return {
    /**
     * Sets the callback function to handle text content.
     * @param callback The callback function to handle text content.
     */
    onTextContent: (
      callback: (text: string, isFinal: boolean) => void | Promise<void>
    ) => {
      onTextContent = callback;
    },
    onFuncCall: (
      callback: (
        name: string,
        mode: ToolMode,
        content: object
      ) => void | Promise<void>
    ) => {
      onFuncCall = callback;
    },
    onError: (callback: (error: Error) => void | Promise<void>) => {
      onError = callback;
    }
  };
}
