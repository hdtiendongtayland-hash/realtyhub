'use client';

import { useEffect } from 'react';

/**
 * Ghi chieu cao THAT cua khung nhin vao bien CSS `--app-vh`.
 *
 * Vi sao khong dung thang `100dvh`: trinh duyet nhung trong ung dung (Zalo,
 * Facebook, Instagram...) hay bao `dvh`/`vh` bang chieu cao ca cua so KE CA
 * phan thanh cong cu cua chinh no dang che o day. Man hinh nao dat chieu cao
 * theo don vi do se dai hon vung nhin thuc, phan day bi thanh cong cu che mat
 * - dung cai loi "bi day len mot khuc" khi xem bang Zalo.
 *
 * `window.visualViewport` moi la vung nguoi dung THUC SU nhin thay, nen lay
 * theo no. Khong co API do (trinh duyet cu) thi lui ve `innerHeight`.
 *
 * Ban phim mo ra cung lam visualViewport thap xuong - luc do man hinh co lai
 * vua khit phan con nhin thay, dung cai ta muon.
 *
 * Dung: `h-[var(--app-vh,100dvh)]` - co bien thi theo bien, chua kip chay thi
 * roi ve 100dvh nhu cu.
 */
const ViewportHeightSync = () => {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      root.style.setProperty('--app-vh', `${Math.round(height)}px`);
    };

    sync();

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', sync);
    viewport?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);

    return () => {
      viewport?.removeEventListener('resize', sync);
      viewport?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, []);

  return null;
};

export default ViewportHeightSync;
