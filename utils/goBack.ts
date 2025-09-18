import { router, Link } from 'expo-router';

export type RoutePath = React.ComponentProps<typeof Link>['href'];

export function goBack(fallbackUrl: RoutePath, forceFallback = false) {
  const canGoBack = router.canGoBack();
  if (!forceFallback && canGoBack) {
    try {
      router.back();
    } catch {
      router.replace(fallbackUrl);
    }
  } else {
    router.replace(fallbackUrl);
  }
}
