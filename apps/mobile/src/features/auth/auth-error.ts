export type AuthFailureCode =
  | 'configuration_error'
  | 'invalid_credentials'
  | 'email_in_use'
  | 'weak_password'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'network_error'
  | 'unknown';

type SupabaseAuthErrorLike = {
  code?: string;
  status?: number;
};

export function mapSupabaseAuthError(error: SupabaseAuthErrorLike | null): AuthFailureCode {
  if (!error) return 'unknown';

  switch (error.code) {
    case 'invalid_credentials':
      return 'invalid_credentials';
    case 'email_exists':
    case 'user_already_exists':
      return 'email_in_use';
    case 'weak_password':
      return 'weak_password';
    case 'email_not_confirmed':
      return 'email_not_confirmed';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'rate_limited';
    default:
      return error.status === 429 ? 'rate_limited' : 'unknown';
  }
}
