import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@repo/shared/constants';
import { DEFAULT_BLUR_DATA_URL } from '@web/lib/constants';

import clsx from 'clsx';
import styles from './main.module.scss';

// ponytail: hospital card hidden until /hospital is implemented (ROUTES.HOSPITAL kept)
const MAIN_ITEMS = [
  { key: 'talkRoom', icon: '/talk-room.png', href: ROUTES.COMMUNITY, colorClass: 'itemRed' },
  { key: 'shopping', icon: '/shopping.png', href: ROUTES.RANKING, colorClass: 'itemPurple' },
] as const;

export default function MainPage() {
  const t = useTranslations('main');

  return (
    <section className={styles.container} suppressHydrationWarning>
      <div className={styles.content}>
        {MAIN_ITEMS.map((item) => (
          <Link
            href={item.href}
            key={item.key}
            className={clsx(styles.item__container, styles[item.colorClass])}
          >
            <div className={styles.item__icon}>
              <Image
                src={item.icon}
                alt=""
                width={56}
                height={56}
                priority
                placeholder="blur"
                blurDataURL={DEFAULT_BLUR_DATA_URL}
                sizes="56px"
                className={styles.item__iconImage}
              />
            </div>
            <div className={styles.item__content}>
              <h2 className={styles.item__title}>{t(`${item.key}.label`)}</h2>
              <p className={styles.item__description}>{t(`${item.key}.description`)}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.sub}>
        <p>{t('chat.prompt')}</p>
        <Link href={ROUTES.CHAT} className={styles.sub__button}>
          {t('chat.button')}
        </Link>
      </div>
    </section>
  );
}
