// SPDX-License-Identifier: MIT
/*
 *                ...
 *              .;lxOXXKkdl,.
 *            ;kXWXOkkk0NWMNk;
 *          ;kNKd:.    ..;lkXNk'                'dOx;                                                                ..            ..'.
 *        ;kNKl.            .co'              .dXMMMK,                                                              ;K0,          ;OXK0l.
 *      .oXKl.                               ,OWWXXMNc                                                             .OMN:         ;KWdcKWd.
 *     ;0Nx.                                :XMNx;xMMk.                                                            ;XMO.        .kMO',KMx.
 *   .lXNd.                                :KMXc .OMX:                                                             cNMd         ,KMd.,KMx.
 *  .oNWd.                                ,0MXc  cNM0'                                                            .OMMd         ,KMd.oWX:
 *  cNMO.                                .xWX:  .dWWl                                                             '0MMd         lNWo'kWx.
 * .OMX;                                 :NWl   cNMO'                                           ...           .,'.oWMWo        .OM0;lW0'
 * lNMx.                                .OMO.  '0MX:                      .''.          .;loccdO0000kooooooox0XWNKNMM0,        .OMOo0Nc
 * .xMMx.                                lNXc  .kMWd.   ...             .lOXWWXOl;'..,lx0XWMMWKKWMWX00000XWMMMMWWMMMMMO.        .OMNXXo.
 * .xMX:                                .OM0' ;OWXl.  .c0Xk'           :KNX0OKWMWWNXNWMMMMKoox:,OMWx....'xWW0l;;;:OWMMO.        .OMMWd.          .....
 *  cXX:                                cNNo'lXWO;   'xNMM0'         .lXO;.. ,0MXko:::oKMX;     ;XMK,   lNWd.    '0MMMO.        ;KMWk.        .:xOOOOkd:.
 *  .kMk.                              .OMN00NO:.   cKX0XWo          :Xk.    .kMOl.   ,0No      'OM0'  ,KMK,     oNMMMO.        dMWx.       .cO0d;'':xXO'
 *   ;XNl                             .dWMMWO;    .dN0;lNWd.        ,KWo     .kMOl.   oMX;     .dWWo   ;XMd     '0WNNMX:       :XNo.      ;xKXd..,lxK0l.
 *    oWNo.                          .oNMMXc     'OWK, '0MX:       ,0WWo     'OMOl.   dMNo...,ckNXo.   :NMd    'kWO:dWMx.    ,xNMN:   ..;kNMMN0k00kl;.
 *    .dNW0c.                       .dNWWMO.   .lKWO,   cNWKc    .lXMMMk'   ,OWNl.    ,OWWXKKNWNO;     '0MO:;cxXW0' .OMNd;cdkXXk0W0ddx0K0OKMWkc:;.
 *      cXMW0c.                   .cOXOcxWX;  ,kWNd.     :0WNx;,lKWNxxXWXkdkXWXo.      .,lxkkd:'        'kNMMMWKo.   'd0NNWXkc. .:clxko;. '0W0;            ..
 *       .oONWKx:.            .;lkKNk;. ;KWklxNWK:        .ckOOkOxl,  .;okOOOd'                           ,lll;.       ..''.               .dXXx;.     .';x0o.
 *          ,oOKXXOocccccccclkKWMNk;     ,x0K0xc.                                                                                            'lk00klcdkKX0x,
 *             .';:lxxxxxxxxxxxo:,.        ...                                                                                                  .,:oxxo:,.
 *
 */
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {LicenseVersion, CantBeEvil} from "@a16z/contracts/licenses/CantBeEvil.sol";


contract ChoodleFEST is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable, CantBeEvil {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    string private _contractMetadataURI;

    constructor()
    ERC721("Choodle FEST", "CHFST")
    CantBeEvil(LicenseVersion.PUBLIC)
    {}

    function safeMint(address to, string memory uri)
    public onlyOwner
    {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
    internal
    override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Enumerable, ERC721URIStorage)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function contractURI()
    public
    view
    returns (string memory)
    {
        return _contractMetadataURI;
    }

    function setContractURI(string memory uri)
    public onlyOwner
    {
        _contractMetadataURI = uri;
    }
}
