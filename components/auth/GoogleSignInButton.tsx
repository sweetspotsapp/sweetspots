import React from 'react'
import { Button } from '../ui/button'
import { SSText } from '../ui/SSText'
import { onGoogleButtonPress } from '@/lib/google-login';

export default function GoogleSignInButton() {

    const[isLoading, setIsLoading] = React.useState(false);
    function handleGoogleSignIn() {
        setIsLoading(true);
        onGoogleButtonPress().then((res) => {
            setIsLoading(false);
        })
    }
  return (
    <Button>
      <SSText>Sign In with Google</SSText>
    </Button>
  )
}