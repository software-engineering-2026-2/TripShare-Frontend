import { NavLink } from 'react-router-dom';
import Brand from '../components/brand/Brand';
import UserMenu from '../components/user-menu/UserMenu';
import { useSession } from '../providers/session';
import { routes } from '../routes/paths';

export default function AppHeader() {
  const { status, profile } = useSession();
  const authenticated = status === 'authenticated' && profile;
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Brand to={routes.trips} />
        <nav className="app-nav" aria-label="Navegação principal">
          <NavLink to={routes.trips}>Viagens</NavLink>
          {authenticated && (
            <NavLink to={routes.profile(profile.id)}>Meu perfil</NavLink>
          )}
        </nav>
        <div className="app-header__account">
          {authenticated ? (
            <UserMenu />
          ) : (
            <NavLink className="app-header__login" to={routes.login}>
              Entrar
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
