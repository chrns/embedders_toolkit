export function SupportButton(props: { href: string }) {
  return (
    <a
      class="button ghost flex items-center gap-2"
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support this project on GitHub Sponsors"
    >
      <img
        src="/icons/support.svg"
        alt=""
        class="w-4 h-4"
        aria-hidden="true"
      />
      <span>Support</span>
    </a>
  );
}