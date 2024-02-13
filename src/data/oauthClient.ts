/**
 * @deprecated use token function
 */
export default interface OAuthClient {
  getSystemClientToken(username: string): Promise<string>
}
