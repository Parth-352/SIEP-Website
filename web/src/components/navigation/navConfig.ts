export function isPortalRoute(
  pathname: string,
  isStandalone: boolean,
  isPortalOnly: boolean
): boolean {
  return (
    isPortalOnly ||
    isStandalone ||
    pathname.startsWith('/log') ||
    pathname.startsWith('/dashboard')
  );
}
