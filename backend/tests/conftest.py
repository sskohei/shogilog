import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from jose import jwk


@pytest.fixture
def ec_key_pair():
    """
    Generate an ES256 (P-256) key pair for signing test tokens and building
    a matching JWKS entry, mirroring Supabase's asymmetric JWT signing keys.
    """
    private_key = ec.generate_private_key(ec.SECP256R1())
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    public_jwk = jwk.construct(private_pem, algorithm="ES256").public_key().to_dict()
    public_jwk["kid"] = "test-key-1"
    public_jwk["use"] = "sig"

    return {
        "private_pem": private_pem,
        "kid": public_jwk["kid"],
        "public_jwk": public_jwk,
    }
