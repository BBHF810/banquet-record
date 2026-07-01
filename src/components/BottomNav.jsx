import { NavLink } from 'react-router-dom';
import { UserCheck, Crown, ShoppingCart } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { path: '/diagnosis', label: '診断', icon: UserCheck },
  { path: '/host', label: '幹事', icon: Crown },
  { path: '/list', label: 'リスト', icon: ShoppingCart },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              <Icon size={24} />
            </div>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
