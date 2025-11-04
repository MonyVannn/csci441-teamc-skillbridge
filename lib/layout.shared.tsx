import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className=" text-base sm:text-2xl font-bold md:font-black flex-shrink-0">
          <div className="-space-y-1 sm:-space-y-2">
            <h1>SKILLBRIDGE.</h1>
          </div>
        </div>
      ),
    },
    githubUrl: "https://github.com/MonyVannn/csci441-teamc-skillbridge",
  };
}
