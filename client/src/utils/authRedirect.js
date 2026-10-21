export function loginPath(redirectTo = "/") {
  const safe = typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/";
  return `/login?redirect=${encodeURIComponent(safe)}`;
}

export function safeRedirectPath(value) {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}
