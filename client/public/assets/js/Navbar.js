export const Navbar = () => {
  const nav = document.createElement('div');
  nav.style.marginBotton = '4rem';
  // nav.style.display = 'flex';
  // nav.style.justifyContent = 'space-around';
  const navbar = document.createElement('ul');
  navbar.style.textAlign = 'left';
  navbar.style.listStyle = 'none';
  navbar.style.padding = 0;
  const navLink = ['home', 'about', 'gallery', 'contact'];
  for (let i = 0; i < navLink.length; i++) {
    const link = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.textContent = navLink[i];
    anchor.href = `/${navLink[i]}`;
    link.appendChild(anchor);
    link.style.display = 'inline-block';
    link.style.width = `calc(100% / ${navLink.length}`;
    link.style.textAlign = 'center';
    navbar.appendChild(link);
  }
  nav.appendChild(navbar);
  return {
    nav
  };
};
