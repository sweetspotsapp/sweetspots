import { router, Link } from 'expo-router';

type RoutePath = React.ComponentProps<typeof Link>['href'];

export function goBack(fallbackUrl: RoutePath) {
  const canGoBack = router.canGoBack();
  if (canGoBack) {
    try {
      router.back();
    } catch {
      router.replace(fallbackUrl);
    }
  } else {
    router.replace(fallbackUrl);
  }
}
