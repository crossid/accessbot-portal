import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EmptyScreen() {
  return (
    <div className="mx-auto px-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome,</CardTitle>
          {/* <CardDescription>/CardDescription> */}
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <p className="text-muted-foreground">
            <span className="text-foreground"></span>
            Use this interactive chatbot to request access for different
            applications.
          </p>
          <p>How to Use:</p>
          <ul className="list-inside list-disc text-muted-foreground">
            <li>
              <span className="text-foreground">Start Chatting:</span> Type your
              queries or use the provided examples below to start a conversation
              with AccessBot.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
