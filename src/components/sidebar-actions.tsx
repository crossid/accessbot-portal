'use client';

import * as React from 'react';
import { useToast } from './ui/use-toast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { IconArchive, IconSpinner } from '@/components/ui/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { customRevalidateTag } from '@/lib/revalidate-tag';
import { ServerActionResult, type Conversation } from '@/lib/types';

interface SidebarActionsProps {
  chat: Conversation;
  archiveChat: (args: { id: string }) => ServerActionResult<void>;
}

export function SidebarActions({ chat, archiveChat }: SidebarActionsProps) {
  const { toast } = useToast();
  const [archiveDialogOpen, setArchiveDialogOpen] = React.useState(false);
  const [isRemovePending, startRemoveTransition] = React.useTransition();

  return (
    <>
      <div className="">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-7 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setArchiveDialogOpen(true)}
            >
              <IconArchive />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Archive chat</TooltipContent>
        </Tooltip>
      </div>
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This chat is active and will be removed from the sidebar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={(event) => {
                event.preventDefault();
                // @ts-ignore
                startRemoveTransition(async () => {
                  const result = await archiveChat({
                    id: chat.id
                  });

                  if (result && 'error' in result) {
                    toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: result.error
                    });
                    return;
                  }

                  setArchiveDialogOpen(false);
                  customRevalidateTag('conversations');
                  toast({
                    title: 'Chat archived'
                  });
                });
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
