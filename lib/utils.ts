import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// 커스텀 폰트 크기 클래스를 font-size 그룹으로 등록 — tailwind-merge가 충돌을 인식하지
// 못하면 text-nano와 text-small이 동시에 적용되어 CSS cascade로 해결되는데,
// 이 경우 의도한 override가 무시될 수 있으므로 명시적으로 그룹 등록.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "pico", "nano", "micro", "caption", "small", "body",
            "heading", "h2", "h1", "title", "hero", "display",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
