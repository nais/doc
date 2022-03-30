# Cryptography

[Tokens](tokens.md) are often [signed](tokens.md#signature) using public-key cryptography, or asymmetric cryptography.
This usually involves having a pair of private and public keys.

In short, the private key is kept secret by one party, while the associated public key can be freely distributed to
other parties. This public key can be used to verify that any data that was signed with the private key indeed was
signed by a party that possesses the private key.

## JWK

A [JSON Web Key](https://datatracker.ietf.org/doc/html/rfc7517) (JWK) is a cryptographic key represented as a JSON
object.

A [JWKS](https://datatracker.ietf.org/doc/html/rfc7517#section-5) (JWK Set) is a closely related term. It is a set of
keys that may contain multiple JWKs.

## Private Keys

If your application integrates with one of the [identity providers](actors.md#identity-provider) in use at NAV, you will 
have a unique _private key_ for each combination of (client, identity provider).

The private key should be, as its name implies, _private_. It is considered to be a secret in line with passwords and
other sensitive keys. It should _never_ be exposed to the browser, an end-user, or committed to version control.

This private key is primarily meant to be used in [client assertions](actors.md#client-assertion) where your client
authenticates itself with a JWT that is signed with said key.

??? example "Private JWK (click to expand)"

    ```json
      {
         "p": "2dZeNRmZow7uWKzqpOolNf7FUIr6dP5bThwnqpcDca7sP96fzPGaryZmYAawZj7h1UthpDp9b2D5v0-D0fSrbdp-MisaOz_ZL-2kdwyTSIP0ii-4yPHpFqaZuGTbuLmROwDhklTGMoYC4fN8vb0jgE6cR33bA52JH255qz5R1rc",
         "kty": "RSA",
         "q": "pIt7sgMqDPGZDMiksZ19R9iuUZk5ZcsnPeI0yAGIaEp75Nc7IH9F1LQ8mPw-wtV3Yde26mByszjeskVfldlReZmzeCTXq4jgu5WEi2GM7craTZj-ES7SLkuP21uvbgxGCLxEizr4RCdZD8TtkxcSG2-GPkp-N4IX9187kvWbWl8",
         "d": "R_P82iKNJflwkPnpOr5eGmtekLvTq1cZwJ7M0vbox3LlVmpIP9iRPKVEwuBva0ybRu1pkvM4S3DFgYK6gKjHVzPYl6lHvKZxbFyP8lJoaj1km2NhA3cwqJjqkx4VAJhLlEuG5wDlTSRXNpzqfamdZcH-XMG2rM-nh6yFqbSzyaeO99ZnGMDp5mZvzGuR0VmV6IXPXqelP4uT9cPQD60h1v2DaOKlmd-0ghGfdHa0hzR5S8C55oZ5hF1_bhgx6tA8VzC1jp41mDbKmKAOKvcFG2T9JQRBml2izRVVaCsVN0_ZCR7NhQYrkreqgVN_ZLlgzI6YSA2EN1FWmc9GvNFAbQ",
         "e": "AQAB",
         "use": "sig",
         "kid": "ut-Fle8JH9IdPqo7QDDakblWR1DdvMIijJT9A-lVntk",
         "qi": "uoncSFVC9_vS652rNSZQO8I7KCk0b2bpt38Sb1iQ8Vha5lYkrTp-AsZLoduj7TscCCqlftm9R-FkfERjEYZLdPKQIaGcCQ-L0RzIG_K3w48Tk2T_EEiMqds4UeBpQxccMjUvX-t_b7pwMjFL1RIEBSWAxg5YShT8C83hv0llh9Y",
         "dp": "BLMxWSfyPqhl0Bf7AA_lOaMDktdMzBVo1uiYmn-jnWJOypn9DKjx03Gap9u9Fpeou7dipe51ImAPQ2dtyqvivv4F1wNDD6AzCWuxLrhgvSHLtueMrxk5FDoH-wiCDRxD2-gK9eNKW3C0wzdDq7xW9b-8c3ZtsUhG2xzBF0bC8UU",
         "alg": "RS256",
         "dq": "R_ji4BhWOlcq9NaGg1I5zEVQ6kw1OPtFbOIW6C0Td1qtGomySSKibslvgBNFeH9auqdaUOZjBVWowx1pE-h8pM3AHJsw4sz6T9K0qSrAM_r4xdxXtThfovRWNkLCV0ZzE7sV2DixA06avDUNHbuHpgyAEZsP3kO_K-qx6jQYAc0",
         "n": "jAQFAKQ9omNtb_I2iSryCulJnkB56qGf35fA1RrDBLup7ysJCez9dnu-HTZ62SKoe-9Pxu-4WzjjBNQacotUXYTIi7GFWM5Pyb4ha-bBJprbiwhyrYGIVzZw4LIcleexWPcIOI0cTKmpM6qKb9_6CTFa-A6uX_16n-n3fQjWGPKrJBY7mcIalJ4YTmLhavs6yt6efSD67SaJ2FabzjouRa_yeDmsGPq2LA-4FymDvuGCHeeMtPO9ClnA2eWC15L7n3-Pagm5pso5GchORl2Rwr_bhCmNCKsC_Qh6TqTHJyymuJwZIuSOv88cf-5UsSidRSJ9r0dBl0S0KgndCagD6Q"
      }
    ```

??? example "Private JWKS / JWK Set (click to expand)"

    ```json
      {
        "keys": [
           {
               "p": "2dZeNRmZow7uWKzqpOolNf7FUIr6dP5bThwnqpcDca7sP96fzPGaryZmYAawZj7h1UthpDp9b2D5v0-D0fSrbdp-MisaOz_ZL-2kdwyTSIP0ii-4yPHpFqaZuGTbuLmROwDhklTGMoYC4fN8vb0jgE6cR33bA52JH255qz5R1rc",
               "kty": "RSA",
               "q": "pIt7sgMqDPGZDMiksZ19R9iuUZk5ZcsnPeI0yAGIaEp75Nc7IH9F1LQ8mPw-wtV3Yde26mByszjeskVfldlReZmzeCTXq4jgu5WEi2GM7craTZj-ES7SLkuP21uvbgxGCLxEizr4RCdZD8TtkxcSG2-GPkp-N4IX9187kvWbWl8",
               "d": "R_P82iKNJflwkPnpOr5eGmtekLvTq1cZwJ7M0vbox3LlVmpIP9iRPKVEwuBva0ybRu1pkvM4S3DFgYK6gKjHVzPYl6lHvKZxbFyP8lJoaj1km2NhA3cwqJjqkx4VAJhLlEuG5wDlTSRXNpzqfamdZcH-XMG2rM-nh6yFqbSzyaeO99ZnGMDp5mZvzGuR0VmV6IXPXqelP4uT9cPQD60h1v2DaOKlmd-0ghGfdHa0hzR5S8C55oZ5hF1_bhgx6tA8VzC1jp41mDbKmKAOKvcFG2T9JQRBml2izRVVaCsVN0_ZCR7NhQYrkreqgVN_ZLlgzI6YSA2EN1FWmc9GvNFAbQ",
               "e": "AQAB",
               "use": "sig",
               "kid": "ut-Fle8JH9IdPqo7QDDakblWR1DdvMIijJT9A-lVntk",
               "qi": "uoncSFVC9_vS652rNSZQO8I7KCk0b2bpt38Sb1iQ8Vha5lYkrTp-AsZLoduj7TscCCqlftm9R-FkfERjEYZLdPKQIaGcCQ-L0RzIG_K3w48Tk2T_EEiMqds4UeBpQxccMjUvX-t_b7pwMjFL1RIEBSWAxg5YShT8C83hv0llh9Y",
               "dp": "BLMxWSfyPqhl0Bf7AA_lOaMDktdMzBVo1uiYmn-jnWJOypn9DKjx03Gap9u9Fpeou7dipe51ImAPQ2dtyqvivv4F1wNDD6AzCWuxLrhgvSHLtueMrxk5FDoH-wiCDRxD2-gK9eNKW3C0wzdDq7xW9b-8c3ZtsUhG2xzBF0bC8UU",
               "alg": "RS256",
               "dq": "R_ji4BhWOlcq9NaGg1I5zEVQ6kw1OPtFbOIW6C0Td1qtGomySSKibslvgBNFeH9auqdaUOZjBVWowx1pE-h8pM3AHJsw4sz6T9K0qSrAM_r4xdxXtThfovRWNkLCV0ZzE7sV2DixA06avDUNHbuHpgyAEZsP3kO_K-qx6jQYAc0",
               "n": "jAQFAKQ9omNtb_I2iSryCulJnkB56qGf35fA1RrDBLup7ysJCez9dnu-HTZ62SKoe-9Pxu-4WzjjBNQacotUXYTIi7GFWM5Pyb4ha-bBJprbiwhyrYGIVzZw4LIcleexWPcIOI0cTKmpM6qKb9_6CTFa-A6uX_16n-n3fQjWGPKrJBY7mcIalJ4YTmLhavs6yt6efSD67SaJ2FabzjouRa_yeDmsGPq2LA-4FymDvuGCHeeMtPO9ClnA2eWC15L7n3-Pagm5pso5GchORl2Rwr_bhCmNCKsC_Qh6TqTHJyymuJwZIuSOv88cf-5UsSidRSJ9r0dBl0S0KgndCagD6Q"
            }
         ]
      }
    ```

## Public Keys

Every private key will have an associated _public_ key that can be freely distributed to other parties. The main purpose
of these public keys is to _verify_ signatures attached to payloads (such as JWTs) that were signed using the private
key.

In most cases, the only public keys you need to concern yourselves with are
the [public keys belonging to the identity provider](actors.md#jwks-endpoint-public-keys) you're using. These are needed
to [verify the signatures](tokens.md#signature-validation) of the tokens that are signed and issued by the identity
provider.

Conversely, your client application might use [client assertions](actors.md#client-assertion) to authenticate itself
with an identity provider. As part of the automated provisioning process, the platform will pre-register corresponding 
_public_ keys for your client at the identity provider. The identity provider will in turn then use these public keys to 
verify the signature of your client assertions as proof of your client's identity.

??? example "Public JWK (click to expand)"

    ```json
      {
          "kty": "RSA",
          "e": "AQAB",
          "use": "sig",
          "kid": "ut-Fle8JH9IdPqo7QDDakblWR1DdvMIijJT9A-lVntk",
          "alg": "RS256",
          "n": "jAQFAKQ9omNtb_I2iSryCulJnkB56qGf35fA1RrDBLup7ysJCez9dnu-HTZ62SKoe-9Pxu-4WzjjBNQacotUXYTIi7GFWM5Pyb4ha-bBJprbiwhyrYGIVzZw4LIcleexWPcIOI0cTKmpM6qKb9_6CTFa-A6uX_16n-n3fQjWGPKrJBY7mcIalJ4YTmLhavs6yt6efSD67SaJ2FabzjouRa_yeDmsGPq2LA-4FymDvuGCHeeMtPO9ClnA2eWC15L7n3-Pagm5pso5GchORl2Rwr_bhCmNCKsC_Qh6TqTHJyymuJwZIuSOv88cf-5UsSidRSJ9r0dBl0S0KgndCagD6Q"
      }
    ```

??? example "Public JWKS / JWK Set (click to expand)"

    ```json
      {
         "keys": [
            {
               "kty": "RSA",
               "e": "AQAB",
               "use": "sig",
               "kid": "ut-Fle8JH9IdPqo7QDDakblWR1DdvMIijJT9A-lVntk",
               "alg": "RS256",
               "n": "jAQFAKQ9omNtb_I2iSryCulJnkB56qGf35fA1RrDBLup7ysJCez9dnu-HTZ62SKoe-9Pxu-4WzjjBNQacotUXYTIi7GFWM5Pyb4ha-bBJprbiwhyrYGIVzZw4LIcleexWPcIOI0cTKmpM6qKb9_6CTFa-A6uX_16n-n3fQjWGPKrJBY7mcIalJ4YTmLhavs6yt6efSD67SaJ2FabzjouRa_yeDmsGPq2LA-4FymDvuGCHeeMtPO9ClnA2eWC15L7n3-Pagm5pso5GchORl2Rwr_bhCmNCKsC_Qh6TqTHJyymuJwZIuSOv88cf-5UsSidRSJ9r0dBl0S0KgndCagD6Q"
            }
         ]
      }
    ```
