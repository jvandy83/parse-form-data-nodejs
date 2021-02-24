export const About = () => {
  const container = document.createElement('div');
  const title = document.createElement('h1');
  const titleText = document.createTextNode('About Page');
  title.append(titleText);
  container.append(title);
  document.body.append(container);
};
