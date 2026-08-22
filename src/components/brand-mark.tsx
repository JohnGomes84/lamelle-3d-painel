import Image from "next/image";

export function BrandMark() {
  return (
    <div className="brand-mark">
      <Image src="/lamelle-logo.jpeg" alt="Logotipo Lamelle 3D" width={168} height={92} priority />
      <div>
        <span className="eyebrow">Painel operacional · Serra · ES</span>
        <strong>Lamelle 3D</strong>
        <small>Lembranças &amp; personalizados</small>
      </div>
    </div>
  );
}
