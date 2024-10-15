module nft_marketplace::marketplace {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_token::token::{Self, TokenDataId, TokenId};
    use aptos_std::table::{Self, Table};

    // Errors
    const ENO_COLLECTION: u64 = 1;
    const ENFT_NOT_FOUND: u64 = 2;
    const ENFT_ALREADY_LISTED: u64 = 3;
    const ENFT_NOT_LISTED: u64 = 4;
    const EINSUFFICIENT_BALANCE: u64 = 5;

    struct Listing has store {
        price: u64,
        seller: address,
    }

    struct MarketplaceData has key {
        collection_name: String,
        collection_description: String,
        collection_uri: String,
        listings: Table<TokenId, Listing>,
    }

    public entry fun initialize_marketplace(
        account: &signer,
        collection_name: String,
        collection_description: String,
        collection_uri: String
    ) {
        let marketplace_data = MarketplaceData {
            collection_name,
            collection_description,
            collection_uri,
            listings: table::new(),
        };

        token::create_collection(
            account,
            marketplace_data.collection_name,
            marketplace_data.collection_description,
            marketplace_data.collection_uri,
            0, // no maximum supply
            vector<bool>[false, false, false], // no mutable settings
        );

        move_to(account, marketplace_data);
    }

    public entry fun mint_nft(
        account: &signer,
        name: String,
        description: String,
        uri: String,
    ) acquires MarketplaceData {
        let marketplace_data = borrow_global_mut<MarketplaceData>(@nft_marketplace);
        
        let token_data_id = token::create_tokendata(
            account,
            marketplace_data.collection_name,
            name,
            description,
            1, // supply of 1 for NFTs
            uri,
            signer::address_of(account),
            1, // royalty denominator
            0, // royalty numerator
            token::create_token_mutability_config(
                &vector<bool>[false, false, false, false, true]
            ),
            vector::empty<String>(),
            vector::empty<vector<u8>>(),
            vector::empty<String>(),
        );

        let token_id = token::mint_token(account, token_data_id, 1);
        token::direct_transfer(account, account, token_id, 1);
    }

    public entry fun list_nft(
        account: &signer,
        token_id: TokenId,
        price: u64
    ) acquires MarketplaceData {
        let marketplace_data = borrow_global_mut<MarketplaceData>(@nft_marketplace);
        assert!(!table::contains(&marketplace_data.listings, token_id), ENFT_ALREADY_LISTED);

        let listing = Listing {
            price,
            seller: signer::address_of(account),
        };

        table::add(&mut marketplace_data.listings, token_id, listing);
        token::opt_in_direct_transfer(account, true);
    }

    public entry fun buy_nft(
        buyer: &signer,
        token_id: TokenId
    ) acquires MarketplaceData {
        let marketplace_data = borrow_global_mut<MarketplaceData>(@nft_marketplace);
        assert!(table::contains(&marketplace_data.listings, token_id), ENFT_NOT_LISTED);

        let listing = table::remove(&mut marketplace_data.listings, token_id);
        let Listing { price, seller } = listing;

        assert!(coin::balance<AptosCoin>(signer::address_of(buyer)) >= price, EINSUFFICIENT_BALANCE);

        coin::transfer<AptosCoin>(buyer, seller, price);
        token::direct_transfer(buyer, seller, token_id, 1);
    }

    public entry fun cancel_listing(
        account: &signer,
        token_id: TokenId
    ) acquires MarketplaceData {
        let marketplace_data = borrow_global_mut<MarketplaceData>(@nft_marketplace);
        assert!(table::contains(&marketplace_data.listings, token_id), ENFT_NOT_LISTED);

        let listing = table::remove(&mut marketplace_data.listings, token_id);
        let Listing { seller, .. } = listing;

        assert!(seller == signer::address_of(account), ENFT_NOT_FOUND);
    }
}
