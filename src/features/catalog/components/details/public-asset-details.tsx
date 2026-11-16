import React from "react";
import HeaderOne from "@/components/layout/header/header";
import FooterThree from "@/components/layout/footer/footer";
import AssetDetailsArea from "./asset-details-area";
import type { AssetKind } from "../../types/asset";

/**
 * Dataset or model detail inside the public site layout, for visitors coming from /datasets or /models.
 * The dashboard keeps its own layout at /dashboard/{dataset,model}-details.
 */
export interface PublicAssetDetailsProps {
  res?: AssetKind;
}

const PublicAssetDetails = ({ res = "Dataset" }: PublicAssetDetailsProps) => {
  return (
    <>
      <HeaderOne />
      <main>
        <AssetDetailsArea res={res} />
      </main>
      <FooterThree />
    </>
  );
};

export default PublicAssetDetails;
