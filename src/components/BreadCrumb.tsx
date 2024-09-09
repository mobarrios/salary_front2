

// components/Breadcrumb.js
'use client'; // Esto marca el componente como un Client Component

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathArray = pathname.split('/').filter((path) => path);

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/">Home</Link>
        </li>
        {pathArray.map((path, index) => {
          const href = '/' + pathArray.slice(0, index + 1).join('/');
          const isLast = index === pathArray.length - 1;

          return isLast ? (
            <li key={href} className="breadcrumb-item active" aria-current="page">
              {decodeURIComponent(path)}
            </li>
          ) : (
            <li key={href} className="breadcrumb-item">
              <Link href={href}>{decodeURIComponent(path)}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;