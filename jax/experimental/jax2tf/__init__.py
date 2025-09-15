"""
Stub for jax.experimental.jax2tf to satisfy tensorflowjs import of `shape_poly`.
This is only intended to bypass optional JAX functionality when converting Keras models.
"""

class _ShapePolyStub:
    class PolyShape:
        pass

# tensorflowjs imports `shape_poly` symbol; provide a harmless placeholder
shape_poly = _ShapePolyStub()
