import { useActions, useUIState } from 'ai/rsc';

import { nanoid } from '@/lib/id';
import { AI } from './actions';
import { ButtonScrollToBottom } from './button-scroll-to-bottom';
import { FooterText } from './footer';
import { UserMessage } from './messages';
import { PromptForm } from './prompt-form';

export interface ChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

type ExampleMessage = {
  heading: string;
  subheading: string;
  message: string;
};

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom
}: ChatPanelProps) {
  // a hook to read and update the UI State.
  //  The state is client-side and can contain functions, React nodes, and other data.
  // UIState is the visual representation of the AI state.
  // const [messages, setMessages] = useUIState<typeof AI>();
  const [messages, setMessages] = useUIState<typeof AI>();
  // A hook to access Server Actions from client, useful for building interfaces that require user interactions with the server.
  // It is required to access these server actions via this hook because they are patched when passed through the context.
  // Accessing them directly may result in a "Cannot find Client Component" error.
  const { submitUserMessage } = useActions();

  const exampleMessages: ExampleMessage[] = [
    // {
    //   heading: 'I need access to',
    //   subheading: 'Advanced Reporting Features Project',
    //   message:
    //     "I need to review the project's adherence to data standards. Can I access the audit details for the Advanced Reporting Features Project?"
    // }
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            exampleMessages.map((example, index) => (
              <div
                key={example.heading}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                  index > 1 && 'hidden md:block'
                }`}
                onClick={async () => {
                  setMessages((currentMessages) => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>
                    }
                  ]);

                  const responseMessage = await submitUserMessage(
                    example.message
                  );

                  setMessages((currentMessages) => [
                    ...currentMessages,
                    responseMessage
                  ]);
                }}
              >
                <div className="text-sm font-semibold">{example.heading}</div>
                <div className="text-sm text-zinc-600">
                  {example.subheading}
                </div>
              </div>
            ))}
        </div>

        {messages?.length >= 2 ? (
          <div className="flex h-12 items-center justify-center"></div>
        ) : null}

        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm input={input} setInput={setInput} />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
