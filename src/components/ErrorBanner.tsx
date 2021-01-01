interface ErrorBannerProps {
    error?: string
}
export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error }) => (
  <div id="moveError" className={error ? "active" : ""}>
    {error}
  </div>
);
