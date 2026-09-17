"use client";
import Image from "next/image";
import { CharacterName, useCharacterCycle } from "./use-character-cycle";

type CharacterAsset = {
  src: string;
  width: number;
  height: number;
};

/** Intrinsic generated-image sizes preserve each approved illustration's transparent aspect ratio. */
const CHARACTER_ASSETS: Record<CharacterName, CharacterAsset> = {
  catgirl: {
    src: "/characters/home-cycle/catgirl.png",
    width: 1024,
    height: 1370,
  },
  robot: {
    src: "/characters/home-cycle/robot.png",
    width: 1225,
    height: 1284,
  },
  reader: {
    src: "/characters/home-cycle/reader.png",
    width: 1352,
    height: 1242,
  },
};

type CharacterLayerProps = {
  name: CharacterName;
  active: boolean;
  priority?: boolean;
};

/** Render one persistent image layer so pair changes can cross-fade without layout shifts. */
function CharacterLayer({ name, active, priority = false }: CharacterLayerProps) {
  const asset = CHARACTER_ASSETS[name];
  return (
    <Image
      className={`home-character-image ${active ? "active" : ""}`}
      data-character={name}
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      sizes="(max-width: 520px) 280px, (max-width: 850px) 340px, 470px"
      priority={priority}
    />
  );
}

/** Place the approved rotating character pairs behind the homepage story carousel. */
export function CharacterCycle() {
  const { pair, cycleRef } = useCharacterCycle();
  return (
    <div
      ref={cycleRef}
      className="home-character-cycle"
      data-left-character={pair.left}
      data-right-character={pair.right}
      aria-hidden="true"
    >
      <div className="home-character-slot home-character-slot-left">
        <CharacterLayer name="catgirl" active={pair.left === "catgirl"} priority />
        <CharacterLayer name="robot" active={pair.left === "robot"} />
        <CharacterLayer name="reader" active={pair.left === "reader"} />
      </div>
      <div className="home-character-slot home-character-slot-right">
        <CharacterLayer name="catgirl" active={pair.right === "catgirl"} />
        <CharacterLayer name="robot" active={pair.right === "robot"} priority />
        <CharacterLayer name="reader" active={pair.right === "reader"} />
      </div>
    </div>
  );
}
