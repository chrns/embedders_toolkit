export function Panel(props: preact.ComponentProps<'section'> & { title?: string }) {
  const { title, children, ...rest } = props;
  return (
    <section class="panel" {...rest}>
      {title && <h3 class="mb-2">{title}</h3>}
      {children}
    </section>
  );
}
