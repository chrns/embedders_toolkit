export function SupportButton(props: { href: string }) {
  return (
    <a
      class="button sponsor flex items-center gap-2"
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support this project on GitHub Sponsors"
    >
      <img
        src="/icons/sponsor.svg"
        alt=""
        class="w-4 h-4"
        aria-hidden="true"
      />
      <span>Sponsor</span>
    </a>
  );
}