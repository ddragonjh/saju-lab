import { getTossShareLink, share } from '@apps-in-toss/web-framework';
import { APP_NAME, OG_IMAGE_URL } from '../../config/appConfig';

export async function shareSafeSummary(path: string, message: string): Promise<'toss' | 'web' | 'clipboard'> {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const deeplink = `intoss://${APP_NAME}${safePath}`;
  try {
    const tossLink = await getTossShareLink(deeplink, OG_IMAGE_URL);
    await share({ message: `${message}\n${tossLink}` });
    return 'toss';
  } catch {
    const url = `https://ddragonjh.github.io/saju-lab/`;
    if (navigator.share) {
      await navigator.share({ title: '운명연구소', text: message, url });
      return 'web';
    }
    await navigator.clipboard.writeText(`${message}\n${url}`);
    return 'clipboard';
  }
}
