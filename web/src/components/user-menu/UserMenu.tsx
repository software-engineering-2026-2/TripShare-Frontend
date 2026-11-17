import { useEffect, useRef, useState } from 'react';
import { useLogout } from '../../hooks/useLogout';
import './styles.css';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, isPending } = useLogout();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (isOpen)
      menu.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [isOpen]);

  return (
    <div
      className="user-menu"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
          trigger.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsOpen(false);
      }}
    >
      <button
        className="user-menu-trigger"
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="user-menu-list"
        onClick={() => setIsOpen((open) => !open)}
      >
        Minha conta
      </button>

      {isOpen && (
        <ul
          ref={menu}
          id="user-menu-list"
          className="user-menu-list"
          role="menu"
        >
          <li role="none">
            <button
              className="user-menu-item"
              type="button"
              role="menuitem"
              onClick={logout}
              disabled={isPending}
            >
              {isPending ? 'Saindo...' : 'Sair'}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
