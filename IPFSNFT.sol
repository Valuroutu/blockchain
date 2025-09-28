// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IPFSNFT is ERC721, Ownable {
    uint256 private _tokenIds;
    mapping(uint256 => string) private _tokenURIs;
    string public baseURI="https://ipfs.io/ipfs/QmRPWueZa4bu9AH2Hs7dNnBxLQN7q1vZFGXmCqUUHbMf6c/1.json";
    


    constructor() ERC721("IPFS NFT", "IPFS") Ownable(msg.sender) {
       
        mintNFT(msg.sender,baseURI);
    }

    function mintNFT(
        address recipient,
        string memory uri
    ) public onlyOwner returns (uint256) {
        _tokenIds += 1;
        _mint(recipient, _tokenIds);
        _tokenURIs[_tokenIds] = uri;
        return _tokenIds;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "URI query for nonexistent token"
        );
        return  baseURI;
    }
}
