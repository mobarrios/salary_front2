import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';

export default function Bread({items}) {
      // const items = [{ label: 'Electronics' }, { label: 'Computer' }, { label: 'Accessories' }, { label: 'Keyboard' }, { label: 'Wireless' }];
      const home = { label:'Home', url: '/' }

    return (
        <BreadCrumb  model={items} home={home} className='mb-3' />
    )
}


// // components/Breadcrumb.js
// 'use client'; // Esto marca el componente como un Client Component

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useRouter } from 'next/navigation'; // Importa el enrutador del App Router

// import { Button } from 'react-bootstrap'; // O utiliza cualquier otro botón o estilo


// const Breadcrumb = () => {
  // const pathname = usePathname();
  // // const pathArray = pathname.split('/').filter((path) => path);
  //  // Split the path into segments and filter out 'admin'
  // const pathArray = pathname
  //   .split('/')
  //   .filter((path) => path && path !== 'admin'); // Exclude 'admin'

  // return (
  //   <nav aria-label="breadcrumb">
  //     <ol className="breadcrumb">
  //       <li className="breadcrumb-item">
  //         <Link href="/">Home</Link>
  //       </li>
  //       {pathArray.map((path, index) => {
  //         const href = '/' + pathArray.slice(0, index + 1).join('/');
  //         const isLast = index === pathArray.length - 1;

  //         return isLast ? (
  //           <li key={href} className="breadcrumb-item active" aria-current="page">
  //             {decodeURIComponent(path)}
  //           </li>
  //         ) : (
  //           <li key={href} className="breadcrumb-item">
  //             <Link href={href}>{decodeURIComponent(path)}</Link>
  //           </li>
  //         );
  //       })}
  //     </ol>
  //   </nav>
  // const router = useRouter();

//   const goBack = () => {
//     router.back();
//   };
//   return (
//     <Button variant="link" onClick={goBack}>
//        <i className="bi bi-arrow-left"></i>
//     </Button>
//   );

  
// };

// export default Breadcrumb;

