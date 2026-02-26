import React from 'react';
import Footer from '@theme-original/Footer';
import ChatWidget from '@site/src/components/ChatWidget';

export default function FooterWrapper(props: any): JSX.Element {
  return (
    <>
      <ChatWidget />
      <Footer {...props} />
    </>
  );
}
