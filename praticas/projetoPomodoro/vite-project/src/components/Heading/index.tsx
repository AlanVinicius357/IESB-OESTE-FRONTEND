
import styles from './styles.module.css';


import React from 'react'; 
type HeadingProps = {
  
  children: React.ReactNode;
};

export function Heading({ children }: HeadingProps) {
  return <h1 className={styles.heading}>{children}</h1>;
}