import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';

import styles from './search-bar.module.scss';

export const SearchBar = () => {
  return (
    <div className={styles.searchBar}>
      <div className={styles.inputContainer}>
        <Input variant="filled" className={styles.input} aria-label="Search posts" />
      </div>
      <div className={styles.buttonContainer}>
        <Button colorScheme="gray" className={styles.button} aria-label="Search">
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
