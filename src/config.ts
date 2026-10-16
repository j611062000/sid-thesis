export const site = {
  name: 'Sid Thesis',
  url: 'https://sidthesis.com',
  tagline: 'Independent Research on Technology, Business & Capital',
  description: 'Independent research exploring how technology works, how businesses compete, and where economic value accrues. Written by Sid.',
  author: 'Sid',
  // Add a real provider-hosted signup URL when the newsletter is ready.
  newsletterUrl: '',
  // Use a verified mailto: address or an HTTPS contact/profile URL.
  contactUrl: '',
};

function validateLink(value: string, protocols: string[], field: string) {
  if (!value) return;
  const url = new URL(value);
  if (!protocols.includes(url.protocol)) throw new Error(`${field} uses an unsupported protocol`);
}
validateLink(site.newsletterUrl, ['https:'], 'newsletterUrl');
validateLink(site.contactUrl, ['https:', 'mailto:'], 'contactUrl');
