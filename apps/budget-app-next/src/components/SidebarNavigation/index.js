'use client';
import { YGroup, ListItem, ListItemText, styled, useThemeName } from 'tamagui';
import './style.css';

export const SidebarNavigation = ({ children }) => {
  const themeName = useThemeName();
  const theme = themeName.includes('light') ? 'light' : 'dark';

  const NavItem = styled(ListItem, {
    acceptsClassName: true,
    variants: {
      theme: {
        light: {
          backgroundColor: 'white',
        },
        dark: {
          backgroundColor: 'dark-gray',
        },
      },
    },
  });

  const NavItemText = styled(ListItemText, {
    acceptsClassName: true,
    display: 'flex',
    textAlign: 'center',
    justifyContent: 'center',
    variants: {
      theme: {
        light: {
          color: 'black',
          hoverStyle: {
            color: 'gray',
          },
        },
        dark: {
          color: 'white',
          hoverStyle: {
            color: 'gray',
          },
        },
      },
    },
  });

  return (
    <div className="sidebar">
      <div className="sidebar__logo">LOGO</div>
      <YGroup alignSelf="center" width="100%" size="$4">
        <YGroup.Item>
          <NavItem theme={theme}>
            <NavItemText theme={theme}>Home</NavItemText>
          </NavItem>
        </YGroup.Item>
        <YGroup.Item>
          <NavItem theme={theme}>
            <NavItemText theme={theme}>Settings</NavItemText>
          </NavItem>
        </YGroup.Item>
      </YGroup>
    </div>
  );
};
