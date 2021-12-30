import styles from './header.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/">
          <img src="/logo.svg" alt="logo" />
        </Link>
      </div>
    </div>
  );
}
