'use client';
import { Button, type ButtonProps } from '@/components/ui/button';
import { IconLogin, IconSpinner } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface LoginButtonProps extends ButtonProps {
  text?: string;
  provider: string;
  signIn: Function;
}

export function LoginButton({
  text = 'Login',
  provider,
  className,
  signIn,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <Button
      variant="outline"
      onClick={() => {
        setIsLoading(true);
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        signIn(provider);
      }}
      disabled={isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="mr-2 animate-spin" />
      ) : (
        <IconLogin className="mr-2" />
      )}
      {text}
    </Button>
  );
}
