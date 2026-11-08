import { useState } from 'react';
import { useLogout } from '../hooks/useLogout';
import '../../../css/user-menu.css';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, isPending } = useLogout();

  return (
    <div className="user-menu">
      <button
        className="user-menu-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="user-menu-list"
        onClick={() => setIsOpen((open) => !open)}
      >
        Minha conta
      </button>

      {isOpen && (
        <ul id="user-menu-list" className="user-menu-list" role="menu">
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
