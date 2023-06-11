export function useAuth() {
  const user = useProperty('security.user')
  const isAuthenticated = computed(() => !!user.value)

  return {
    isAuthenticated,
    user,
  }
}
