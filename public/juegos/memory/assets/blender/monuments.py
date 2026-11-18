# Ilustraciones 3D (estilo diorama) de los 12 monumentos del Memory de Barcelona.
#
# Uso (desde esta carpeta):
#   blender -b -P monuments.py -- ../../img            -> genera los 12 PNG
#   blender -b -P monuments.py -- ../../img sagrada    -> solo los ids indicados
#
# Salida: <carpeta>/<id>.png, 512x512, RGBA con fondo transparente.
# Todo se modela con primitivas y mallas generadas por código (sin imágenes externas).
# Al final, cada PNG se reduce a 256 colores con paleta (k-means con numpy) para que pese poco.
import bpy, bmesh, math, sys, os, zlib, struct
import numpy as np
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "out"
ONLY = argv[1:]
SAMPLES = 80
GROUND = {"top": "#e8dcc6"}

# ------------------------------------------------------------------ materiales
def hexc(h):
    h = h.lstrip("#")
    return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))

_MATS = {}

def _nodes(m):
    nt = m.node_tree
    return nt, nt.nodes, nt.links, nt.nodes["Principled BSDF"]

def _coord(nt):
    tc = nt.nodes.new("ShaderNodeTexCoord")
    return tc.outputs["Object"]

def _ramp(nt, colors, inp, constant=True):
    r = nt.nodes.new("ShaderNodeValToRGB")
    cr = r.color_ramp
    if constant: cr.interpolation = "CONSTANT"
    n = len(colors)
    while len(cr.elements) < n: cr.elements.new(0.5)
    for i, c in enumerate(colors):
        cr.elements[i].position = i / n if constant else i / max(n - 1, 1)
        cr.elements[i].color = (*hexc(c), 1)
    nt.links.new(inp, r.inputs["Fac"])
    return r.outputs["Color"]

def _sk(col, ident):
    return next(x for x in col if x.identifier == ident)

def _mix(nt, fac, a, b):
    m = nt.nodes.new("ShaderNodeMix"); m.data_type = "RGBA"
    nt.links.new(fac, _sk(m.inputs, "Factor_Float")) if not isinstance(fac, float) else None
    if isinstance(fac, float): _sk(m.inputs, "Factor_Float").default_value = fac
    for sock, v in (("A_Color", a), ("B_Color", b)):
        if isinstance(v, tuple): _sk(m.inputs, sock).default_value = (*v, 1)
        else: nt.links.new(v, _sk(m.inputs, sock))
    return _sk(m.outputs, "Result_Color")

def mat(color, kind="plain", rough=0.6, metal=0.0, **kw):
    """kind: plain, stone, brick, mosaic, glories, glass, glow"""
    key = (str(color), kind, rough, metal, str(sorted(kw.items())))
    if key in _MATS: return _MATS[key]
    m = bpy.data.materials.new(kind); m.use_nodes = True
    nt, N, L, b = _nodes(m)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    base = b.inputs["Base Color"]
    if kind == "plain":
        base.default_value = (*hexc(color), 1)
    elif kind == "stone":   # piedra con leve variación
        nz = N.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = kw.get("scale", 3.0)
        L.new(_coord(nt), nz.inputs["Vector"])
        c2 = kw.get("c2") or color
        r = _ramp(nt, [color, c2], nz.outputs["Fac"], constant=False)
        L.new(r, base)
        bump = N.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.15
        L.new(nz.outputs["Fac"], bump.inputs["Height"]); L.new(bump.outputs["Normal"], b.inputs["Normal"])
    elif kind == "brick":
        br = N.new("ShaderNodeTexBrick")
        br.inputs["Color1"].default_value = (*hexc(color), 1)
        br.inputs["Color2"].default_value = (*hexc(kw.get("c2", color)), 1)
        br.inputs["Mortar"].default_value = (*hexc(kw.get("mortar", "#e9d8bf")), 1)
        br.inputs["Scale"].default_value = kw.get("scale", 9.0)
        br.inputs["Mortar Size"].default_value = 0.012
        sep = N.new("ShaderNodeSeparateXYZ"); L.new(_coord(nt), sep.inputs[0])
        cmb = N.new("ShaderNodeCombineXYZ")
        add = N.new("ShaderNodeMath"); add.operation = "ADD"
        L.new(sep.outputs["X"], add.inputs[0]); L.new(sep.outputs["Y"], add.inputs[1])
        L.new(add.outputs[0], cmb.inputs["X"]); L.new(sep.outputs["Z"], cmb.inputs["Y"])
        L.new(cmb.outputs[0], br.inputs["Vector"])
        L.new(br.outputs["Color"], base)
    elif kind == "mosaic":  # trencadís: celdas de colores con junta clara
        sc = kw.get("scale", 6.0)
        v1 = N.new("ShaderNodeTexVoronoi"); v1.inputs["Scale"].default_value = sc
        v2 = N.new("ShaderNodeTexVoronoi"); v2.inputs["Scale"].default_value = sc
        v2.feature = "DISTANCE_TO_EDGE"
        co = _coord(nt); L.new(co, v1.inputs["Vector"]); L.new(co, v2.inputs["Vector"])
        sep = N.new("ShaderNodeSeparateColor"); L.new(v1.outputs["Color"], sep.inputs[0])
        pal = _ramp(nt, color, sep.outputs["Red"])
        edge = N.new("ShaderNodeMath"); edge.operation = "LESS_THAN"
        edge.inputs[1].default_value = kw.get("grout", 0.06)
        L.new(v2.outputs["Distance"], edge.inputs[0])
        L.new(_mix(nt, edge.outputs[0], pal, hexc(kw.get("mortar", "#f4efe4"))), base)
        b.inputs["Roughness"].default_value = 0.3
    elif kind == "glories":  # degradado rojo -> azul con cuadrícula de paneles
        sep = N.new("ShaderNodeSeparateXYZ"); L.new(_coord(nt), sep.inputs[0])
        mr = N.new("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = kw.get("z0", 0); mr.inputs["From Max"].default_value = kw.get("z1", 6)
        L.new(sep.outputs["Z"], mr.inputs["Value"])
        # pequeña variación por panel
        vor = N.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 9
        L.new(_coord(nt), vor.inputs["Vector"])
        sp = N.new("ShaderNodeSeparateColor"); L.new(vor.outputs["Color"], sp.inputs[0])
        jit = N.new("ShaderNodeMath"); jit.operation = "MULTIPLY_ADD"
        jit.inputs[1].default_value = 0.18; jit.inputs[2].default_value = -0.09
        L.new(sp.outputs["Red"], jit.inputs[0])
        add = N.new("ShaderNodeMath"); add.operation = "ADD"; add.use_clamp = True
        L.new(mr.outputs[0], add.inputs[0]); L.new(jit.outputs[0], add.inputs[1])
        grad = _ramp(nt, color, add.outputs[0], constant=False)
        br = N.new("ShaderNodeTexBrick"); br.offset = 0.0
        br.inputs["Color1"].default_value = (1, 1, 1, 1); br.inputs["Color2"].default_value = (1, 1, 1, 1)
        br.inputs["Mortar"].default_value = (0.55, 0.6, 0.7, 1)
        br.inputs["Scale"].default_value = 7; br.inputs["Mortar Size"].default_value = 0.03
        br.inputs["Brick Width"].default_value = 0.5; br.inputs["Row Height"].default_value = 0.3
        cmb = N.new("ShaderNodeCombineXYZ")
        at = N.new("ShaderNodeMath"); at.operation = "ARCTAN2"
        L.new(sep.outputs["Y"], at.inputs[0]); L.new(sep.outputs["X"], at.inputs[1])
        L.new(at.outputs[0], cmb.inputs["X"]); L.new(sep.outputs["Z"], cmb.inputs["Y"])
        L.new(cmb.outputs[0], br.inputs["Vector"])
        mul = N.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
        _sk(mul.inputs, "Factor_Float").default_value = 1
        L.new(grad, _sk(mul.inputs, "A_Color")); L.new(br.outputs["Color"], _sk(mul.inputs, "B_Color"))
        L.new(_sk(mul.outputs, "Result_Color"), base)
        b.inputs["Roughness"].default_value = 0.25
    elif kind == "glass":
        base.default_value = (*hexc(color), 1)
        b.inputs["Roughness"].default_value = 0.15
    elif kind == "glow":
        base.default_value = (*hexc(color), 1)
        b.inputs["Emission Color"].default_value = (*hexc(color), 1)
        b.inputs["Emission Strength"].default_value = kw.get("strength", 2.0)
    _MATS[key] = m
    return m

def M(spec):
    """spec: '#hex' o tupla (color, kind, {kwargs})"""
    if isinstance(spec, bpy.types.Material): return spec
    if isinstance(spec, str): return mat(spec)
    return mat(spec[0], spec[1], **(spec[2] if len(spec) > 2 else {}))

# ------------------------------------------------------------------ geometría
def _finish(o, spec, bevel=0.0, smooth=False):
    o.data.materials.clear(); o.data.materials.append(M(spec))
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    if bevel > 0:
        md = o.modifiers.new("bv", "BEVEL"); md.width = bevel; md.segments = 2
        md.limit_method = "ANGLE"; md.angle_limit = math.radians(50)
    return o

def _apply_scale(o, s):
    o.data.transform(Matrix.Diagonal((*s, 1))); o.scale = (1, 1, 1)

def box(loc, size, spec, rot=(0, 0, 0), bevel=0.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; _apply_scale(o, size)
    return _finish(o, spec, min(bevel, min(size) * 0.3))

def cyl(loc, r, h, spec, verts=32, rot=(0, 0, 0), scale=(1, 1, 1), bevel=0.03, smooth=True):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot)
    o = bpy.context.object; _apply_scale(o, scale)
    return _finish(o, spec, min(bevel, r * 0.3, h * 0.3), smooth)

def cone(loc, r1, r2, h, spec, verts=32, rot=(0, 0, 0), smooth=True, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=h, location=loc, rotation=rot)
    o = bpy.context.object; _apply_scale(o, scale)
    return _finish(o, spec, 0, smooth)

def sph(loc, r, spec, scale=(1, 1, 1), rot=(0, 0, 0), seg=32):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, rotation=rot, segments=seg, ring_count=seg // 2)
    o = bpy.context.object; _apply_scale(o, scale)
    return _finish(o, spec, 0, True)

def torus(loc, R, r, spec, rot=(0, 0, 0), scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot,
                                     major_segments=32, minor_segments=10)
    o = bpy.context.object; _apply_scale(o, scale)
    return _finish(o, spec, 0, True)

def mesh_obj(name, verts, faces, spec, loc=(0, 0, 0), rot=(0, 0, 0), smooth=False, bevel=0.0):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    o.location = loc; o.rotation_euler = rot
    return _finish(o, spec, bevel, smooth)

def lathe(prof, spec, loc=(0, 0, 0), seg=32, smooth=True, sx=1.0, sy=1.0):
    """Sólido de revolución a partir de un perfil [(radio, z), ...] de abajo arriba."""
    verts, faces, rings = [], [], []
    for r, z in prof:
        if r < 1e-4:
            rings.append([len(verts)]); verts.append((0, 0, z))
        else:
            idx = []
            for i in range(seg):
                a = 2 * math.pi * i / seg
                idx.append(len(verts)); verts.append((r * math.cos(a) * sx, r * math.sin(a) * sy, z))
            rings.append(idx)
    for A, B in zip(rings, rings[1:]):
        if len(A) == 1 and len(B) > 1:
            for i in range(seg): faces.append((A[0], B[i], B[(i + 1) % seg]))
        elif len(B) == 1 and len(A) > 1:
            for i in range(seg): faces.append((A[i], A[(i + 1) % seg], B[0]))
        elif len(A) > 1:
            for i in range(seg): faces.append((A[i], A[(i + 1) % seg], B[(i + 1) % seg], B[i]))
    if len(rings[0]) > 1: faces.append(tuple(reversed(rings[0])))
    if len(rings[-1]) > 1: faces.append(tuple(rings[-1]))
    return mesh_obj("lathe", verts, faces, spec, loc, smooth=smooth)

def prism(pts2d, depth, spec, loc=(0, 0, 0), rot=(0, 0, 0), bevel=0.0):
    """Extruye un polígono 2D (u, v) en el plano XZ con grosor 'depth' en Y."""
    n = len(pts2d)
    verts = [(u, -depth / 2, v) for u, v in pts2d] + [(u, depth / 2, v) for u, v in pts2d]
    faces = [tuple(range(n)), tuple(range(2 * n - 1, n - 1, -1))]
    for i in range(n):
        j = (i + 1) % n; faces.append((i, n + i, n + j, j))
    o = mesh_obj("prism", verts, faces, spec, loc, rot, bevel=bevel)
    return o

def plan_prism(pts2d, z0, z1, spec, bevel=0.03):
    """Extruye un polígono en planta (x, y) entre z0 y z1."""
    n = len(pts2d)
    verts = [(x, y, z0) for x, y in pts2d] + [(x, y, z1) for x, y in pts2d]
    faces = [tuple(range(n - 1, -1, -1)), tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n; faces.append((i, j, n + j, n + i))
    return mesh_obj("plan", verts, faces, spec, bevel=bevel)

def arch_pts(w, h, kind="pointed", n=10):
    """Contorno de una ventana/puerta con arco (u centrada, v desde 0)."""
    hw = w / 2
    if kind == "rect":
        return [(-hw, 0), (hw, 0), (hw, h), (-hw, h)]
    if kind == "round":
        spring = h - hw
        pts = [(-hw, 0), (hw, 0)]
        for i in range(n + 1):
            a = math.pi * i / n
            pts.append((hw * math.cos(a), spring + hw * math.sin(a)))
        return pts
    # apuntado (gótico): dos arcos de radio w
    spring = h - w * 0.866
    pts = [(-hw, 0), (hw, 0)]
    for i in range(n + 1):
        a = math.radians(60) * i / n
        pts.append((-hw + w * math.cos(a), spring + w * math.sin(a)))
    for i in range(n + 1):
        a = math.radians(120) + math.radians(60) * i / n
        pts.append((hw + w * math.cos(a), spring + w * math.sin(a)))
    # elimina el vértice duplicado del vértice superior
    out = []
    for p in pts:
        if not out or (abs(out[-1][0] - p[0]) > 1e-5 or abs(out[-1][1] - p[1]) > 1e-5): out.append(p)
    return out

def opening(x, y, z, w, h, spec="#3b3430", kind="pointed", face=-1, rotz=0.0, d=0.06):
    """Hueco oscuro (ventana/puerta) pegado a una fachada. face=-1 mira a -Y."""
    return prism(arch_pts(w, h, kind), d, spec, loc=(x, y, z), rot=(0, 0, rotz))

def pinnacle(x, y, z, r, h, spec, ball=None):
    o = cone((x, y, z + h / 2), r, 0.0, h, spec, verts=8, smooth=False)
    if ball: sph((x, y, z + h), r * 0.45, ball, seg=12)
    return o

def cross3d(x, y, z, s, spec):
    """Cruz de cuatro brazos (tipo Gaudí)."""
    box((x, y, z), (s, s * 0.25, s * 0.25), spec, bevel=0.02)
    box((x, y, z), (s * 0.25, s, s * 0.25), spec, bevel=0.02)
    box((x, y, z + s * 0.15), (s * 0.25, s * 0.25, s * 1.3), spec, bevel=0.02)

def tree(x, y, z=0, h=0.9, kind="round", spec="#5f9e4f"):
    cyl((x, y, z + h * 0.2), 0.05, h * 0.4, "#7a5534", verts=8)
    if kind == "cypress":
        sph((x, y, z + h * 0.65), h * 0.18, spec, scale=(1, 1, 3.0), seg=16)
    elif kind == "palm":
        cyl((x, y, z + h * 0.6), 0.04, h * 1.0, "#9b7a50", verts=8)
        for k in range(6):
            a = k * math.pi / 3
            sph((x + 0.18 * math.cos(a), y + 0.18 * math.sin(a), z + h * 1.08), 0.2, spec,
                scale=(1.4, 0.35, 0.18), rot=(0, 0.35, a), seg=12)
    else:
        sph((x, y, z + h * 0.6), h * 0.32, spec, seg=16)
        sph((x + h * 0.12, y - h * 0.05, z + h * 0.75), h * 0.24, spec, seg=16)

# ------------------------------------------------------------------ paletas
SAND = ("#d9b98a", "stone", {"c2": "#c9a272", "scale": 2.5})
GREY = ("#cfc6b4", "stone", {"c2": "#b9b09c", "scale": 2.5})
DARK = "#3a332e"
GOLD = ("#e5b53c", "plain", {"rough": 0.25, "metal": 0.8})
BRICK = ("#b9573a", "brick", {"c2": "#a64a31", "mortar": "#e7cfae", "scale": 10})
GRASS = "#8cc46a"
WARM_MOSAIC = ["#e4573d", "#f2c744", "#3da5c9", "#5db060", "#f3f0e6", "#e88a3a"]

# ------------------------------------------------------------------ monumentos
def sagrada():
    GROUND["top"] = "#e6dac3"
    stone = ("#cfa877", "stone", {"c2": "#b98d5c", "scale": 3})
    tower = ("#dcbf92", "stone", {"c2": "#c7a271", "scale": 4})
    # cuerpo de la fachada del Nacimiento
    box((0, 0.2, 1.1), (4.4, 1.6, 2.2), stone)
    box((0, 1.6, 1.6), (3.0, 1.6, 3.2), stone)  # nave detrás
    for x, w, h in [(-1.45, 0.8, 1.5), (0, 1.0, 1.9), (1.45, 0.8, 1.5)]:
        opening(x, -0.62, 0.0, w, h, DARK)
        # gablete ornamental sobre cada portal
        cone((x, -0.55, 2.2 + h * 0.35), w * 0.62, 0.05, h * 0.75, stone, verts=6, smooth=False)
    # ciprés verde del portal central y estrella
    sph((0, -0.45, 3.35), 0.26, "#3f8a4a", scale=(1, 1, 2.0), seg=16)
    sph((0, -0.45, 3.95), 0.09, "#f3f0e6", seg=12)
    # 4 campanarios parabólicos con remates de colores
    for x, h in [(-1.75, 4.8), (-0.6, 5.5), (0.6, 5.5), (1.75, 4.8)]:
        z0 = 1.6
        prof = [(0.42, 0)] + [(0.42 * (1 - (t / 10) ** 1.6) + 0.08, h * t / 10) for t in range(1, 11)]
        lathe(prof, tower, loc=(x, 0.15, z0), seg=16)
        # ventanales en espiral (franjas oscuras)
        for k in range(6):
            zz = z0 + 0.6 + k * h / 8.5
            rr = 0.42 * (1 - ((zz - z0) / h) ** 1.6) + 0.085
            box((x, 0.15 - rr, zz), (rr * 0.5, 0.05, 0.22), "#6d4f34", bevel=0.01)
        top = z0 + h
        # remate: mitra de mosaico + bola
        lathe([(0.16, 0), (0.26, 0.18), (0.24, 0.45), (0.13, 0.68), (0.0, 0.8)],
              (["#f2c744", "#e4573d", "#f2c744", "#e88a3a", "#f3f0e6"], "mosaic", {"scale": 10, "grout": 0.04}), loc=(x, 0.15, top))
        for a in range(4):
            ang = a * math.pi / 2
            sph((x + 0.19 * math.cos(ang), 0.15 + 0.19 * math.sin(ang), top + 0.3), 0.07, "#f3f0e6", seg=12)
        sph((x, 0.15, top + 0.86), 0.1, "#e4573d", seg=12)
    # torre de Jesucristo (central, más alta) con cruz blanca
    prof = [(0.55, 0)] + [(0.55 * (1 - (t / 10) ** 1.5) + 0.06, 6.6 * t / 10) for t in range(1, 11)]
    lathe(prof, ("#e3d2b3", "stone", {"c2": "#cbb894"}), loc=(0, 1.7, 2.6), seg=16)
    cross3d(0, 1.7, 9.45, 0.55, ("#f5f3ee", "plain", {"rough": 0.2}))
    # grúa amarilla
    box((2.6, 1.9, 4.3), (0.16, 0.16, 8.6), "#f2b632", bevel=0.01)
    box((1.9, 1.9, 8.5), (2.6, 0.14, 0.14), "#f2b632", bevel=0.01)
    box((3.25, 1.9, 8.5), (0.5, 0.3, 0.3), "#5c5c5c")
    cyl((1.0, 1.9, 7.6), 0.012, 1.7, "#333333", verts=6)

def guell():
    GROUND["top"] = "#e9d9b4"
    cream = ("#efe0bf", "stone", {"c2": "#e2cfa6", "scale": 3})
    mos = (WARM_MOSAIC, "mosaic", {"scale": 7})
    # sala hipóstila: plataforma sobre columnas dóricas
    box((0, 1.15, 1.7), (3.8, 1.6, 0.25), cream)
    for i in range(6):
        for j, y in enumerate((0.55, 1.35)):
            x = -1.6 + i * 0.64
            cyl((x, y, 0.8), 0.15, 1.6, ("#f4ecdb", "stone", {"c2": "#e5dac2"}), verts=16)
            cyl((x, y, 1.55), 0.22, 0.1, "#f4ecdb", verts=16)
    # banco ondulado de trencadís
    n = 64; verts = []; faces = []
    pts = [(-1.85 + 3.7 * i / (n - 1), 0.45 + 0.2 * math.sin(i / (n - 1) * math.pi * 5)) for i in range(n)]
    for (x, y) in pts:
        for dy, z in ((0, 1.82), (0, 2.3), (0.16, 2.38), (0.16, 1.82)):
            verts.append((x, y + dy, z))
    for i in range(n - 1):
        for k in range(4):
            a, b2 = i * 4 + k, i * 4 + (k + 1) % 4
            faces.append((a, a + 4 if False else b2, b2 + 4, a + 4))
    faces.append((0, 1, 2, 3)); faces.append(tuple(range((n - 1) * 4 + 3, (n - 1) * 4 - 1, -1)))
    mesh_obj("banc", verts, faces, mos, smooth=True)
    # escalinata con la salamandra (el dragón)
    for k in range(6):
        box((0, -0.25 - k * 0.27, 0.12 + (5 - k) * 0.12), (1.2, 0.3, 0.24 + (5 - k) * 0.24), cream, bevel=0.02)
    sal = (["#4fae5a", "#2e8bc0", "#f2c744", "#e88a3a", "#7dc66e"], "mosaic", {"scale": 14, "grout": 0.08})
    sph((0, -1.0, 1.0), 0.42, sal, scale=(0.8, 1.9, 0.6), rot=(0.35, 0, 0))
    sph((0, -1.75, 0.82), 0.27, sal, scale=(1.0, 1.3, 0.85))
    sph((0.15, -1.9, 0.95), 0.05, DARK, seg=10); sph((-0.15, -1.9, 0.95), 0.05, DARK, seg=10)
    torus((0, -0.35, 1.25), 0.22, 0.07, sal, rot=(0, math.pi / 2, 0))
    for sx in (-1, 1):
        for y in (-1.35, -0.7):
            sph((sx * 0.34, y, 0.85), 0.1, sal, scale=(1.6, 1, 0.7), seg=12)
    # dos pabellones de entrada (casa de pan de jengibre)
    for sx in (-1, 1):
        x = sx * 1.95
        box((x, -0.9, 0.8), (1.1, 1.1, 1.6), ("#d9a86c", "stone", {"c2": "#c08e55"}), bevel=0.08)
        opening(x, -1.46, 0.25, 0.32, 0.6, "#5a3d2a", kind="round")
        opening(x - sx * 0.3, -1.46, 1.0, 0.18, 0.3, "#5a3d2a", kind="round")
        lathe([(0.75, 0), (0.7, 0.25), (0.55, 0.6), (0.35, 0.95), (0.15, 1.2), (0.0, 1.3)],
              (["#8b5a3c", "#f3f0e6", "#a36a45", "#f3f0e6", "#6b442c"], "mosaic", {"scale": 9}),
              loc=(x, -0.9, 1.6), seg=24, sy=0.9)
    # remate tipo seta (Casa del Guarda)
    cyl((-1.95, -0.9, 3.0), 0.06, 0.25, "#f3f0e6", verts=10)
    sph((-1.95, -0.9, 3.15), 0.22, "#d8402f", scale=(1, 1, 0.55))
    for a in range(5):
        ang = a * 2 * math.pi / 5
        sph((-1.95 + 0.14 * math.cos(ang), -0.9 + 0.14 * math.sin(ang), 3.24), 0.04, "#ffffff", seg=10)
    # torre con damero azul y blanco y cruz
    chk = (["#2e6fb0", "#f5f3ee"], "brick", {})
    chk = (["#2e6fb0", "#f5f3ee", "#3d8fd0", "#f5f3ee"], "mosaic", {"scale": 9, "grout": 0.03})
    lathe([(0.18, 0), (0.2, 0.4), (0.16, 1.0), (0.1, 1.3), (0.0, 1.35)], chk, loc=(1.95, -0.9, 2.55), seg=20)
    cross3d(1.95, -0.9, 4.05, 0.32, "#f5f3ee")
    # muro de entrada con trencadís
    for sx in (-1, 1):
        box((sx * 2.25, 0.4, 0.4), (0.6, 1.2, 0.8), cream)
        box((sx * 2.25, 0.4, 0.86), (0.64, 1.24, 0.12), mos, bevel=0.03)

def batllo():
    GROUND["top"] = "#ddd6c8"
    # edificios vecinos (contexto) sencillos
    for sx in (-1, 1):
        box((sx * 1.85, 0.35, 1.6), (0.9, 1.3, 3.2), ("#e9ddc8", "stone", {"c2": "#ded0b7"}))
        for z in (1.0, 1.8, 2.5):
            for dx in (-0.2, 0.2):
                opening(sx * 1.85 + dx, -0.32, z, 0.2, 0.42, "#6b625a", kind="rect")
    # fachada principal de trencadís azul-verde
    fac = (["#5fb3b3", "#3d8fb0", "#7cc3b5", "#9ad0c4", "#d98fa8", "#4a9e8e"], "mosaic", {"scale": 11, "grout": 0.025})
    box((0, 0.1, 2.1), (2.8, 1.2, 4.2), fac, bevel=0.03)
    # planta baja y principal de piedra con columnas tipo hueso
    stone = ("#e3d3b5", "stone", {"c2": "#d2bf9a"})
    box((0, -0.55, 0.75), (2.84, 0.14, 1.5), stone, bevel=0.05)
    for x in (-1.0, 0.0, 1.0):
        opening(x, -0.64, 0.05, 0.75, 1.3, "#33444d", kind="round")
    for x in (-1.15, -0.62, -0.1, 0.42, 0.95, 1.3):
        pass
    for x in (-0.55, 0.45):
        for zz in (0.35, 0.9):
            sph((x + 0.05, -0.66, zz), 0.08, stone, scale=(1, 1, 1.6), seg=12)
    for k, x in enumerate((-1.25, -0.7, -0.25, 0.25, 0.7, 1.25)):
        cyl((x, -0.68, 1.15), 0.06, 0.7, stone, verts=12, scale=(1, 1, 1))
        sph((x, -0.68, 1.5), 0.09, stone, seg=12)
    # balcones-máscara
    for z in (2.1, 2.75, 3.4):
        for x in (-0.95, -0.32, 0.32, 0.95):
            opening(x, -0.52, z - 0.25, 0.32, 0.55, "#2c3a40", kind="round")
            m = sph((x, -0.62, z - 0.15), 0.21, "#f2ece0", scale=(1.15, 0.5, 0.75))
            sph((x - 0.08, -0.72, z - 0.1), 0.045, DARK, seg=10)
            sph((x + 0.08, -0.72, z - 0.1), 0.045, DARK, seg=10)
    # tejado lomo de dragón (escamas de cerámica)
    scales = (["#2f8f6f", "#4fae7f", "#2e7f9e", "#d9735a", "#e4a35a", "#7a5aa0"], "mosaic", {"scale": 7, "grout": 0.03, "mortar": "#2a4a40"})
    sph((0.25, 0.0, 4.2), 1.0, scales, scale=(1.3, 0.7, 0.85))
    for k in range(11):
        x = -0.95 + k * 0.24
        zz = 4.2 + 0.85 * math.sqrt(max(0.0, 1 - ((x - 0.25) / 1.3) ** 2))
        sph((x, -0.05, zz), 0.11, ("#e4b356", "plain", {"rough": 0.25}), seg=12)
    # torre con bulbo y cruz
    cyl((-1.05, -0.3, 4.6), 0.16, 1.0, ("#f0e6d2", "stone", {}), verts=16)
    lathe([(0.0, 0), (0.18, 0.05), (0.26, 0.25), (0.2, 0.45), (0.0, 0.6)],
          (["#e4b356", "#d9734d", "#f3f0e6"], "mosaic", {"scale": 12}), loc=(-1.05, -0.3, 5.05))
    cross3d(-1.05, -0.3, 5.85, 0.36, ("#e4b356", "plain", {"rough": 0.3}))

def wavy_wall(x0, x1, z0, z1, y0, amp, spec, floors=5, nx=60, nz=40, depth=1.6):
    verts, faces = [], []
    fh = (z1 - z0) / floors
    def yf(x, z):
        u = (x - x0) / (x1 - x0)
        ph = (z - z0) / fh
        band = 0.5 + 0.5 * math.cos(2 * math.pi * ph)  # cornisas onduladas por planta
        return y0 - amp * (0.6 * math.sin(u * math.pi * 3 + ph * 0.6) + 0.4) * (0.4 + 0.6 * band)
    for j in range(nz + 1):
        z = z0 + (z1 - z0) * j / nz
        for i in range(nx + 1):
            x = x0 + (x1 - x0) * i / nx
            verts.append((x, yf(x, z), z))
    W = nx + 1
    for j in range(nz):
        for i in range(nx):
            a = j * W + i; faces.append((a, a + 1, a + 1 + W, a + W))
    o = mesh_obj("wavy", verts, faces, spec, smooth=True)
    sd = o.modifiers.new("s", "SOLIDIFY"); sd.thickness = 0.12
    return yf

def pedrera():
    GROUND["top"] = "#ddd6c8"
    st = ("#e0cca6", "stone", {"c2": "#cdb68c", "scale": 2})
    x0, x1, z0, z1 = -2.3, 2.3, 0.0, 3.6
    box((0, 0.7, 1.8), (4.5, 1.6, 3.6), st, bevel=0.02)
    yf = wavy_wall(x0, x1, z0, z1, -0.05, 0.5, st, floors=5)
    # ventanas y balcones de hierro forjado
    fh = (z1 - z0) / 5
    for f in range(5):
        for k in range(6):
            x = x0 + 0.4 + k * (x1 - x0 - 0.8) / 5
            z = z0 + f * fh + 0.18
            y = min(yf(x, z), yf(x, z + 0.4)) - 0.04
            opening(x, y + 0.1, z, 0.4, 0.45, "#2d2a27", kind="round", d=0.3)
            if f > 0:
                # rejas retorcidas: pequeños anillos y barras oscuras
                yb = y - 0.08
                torus((x, yb, z + 0.12), 0.26, 0.03, "#24221f", rot=(math.pi / 2, 0, 0), scale=(1, 0.6, 0.5))
                torus((x - 0.07, yb, z + 0.2), 0.1, 0.02, "#24221f", rot=(math.pi / 2, 0.4, 0))
                torus((x + 0.08, yb, z + 0.18), 0.08, 0.02, "#24221f", rot=(math.pi / 2, -0.3, 0))
    # azotea: buhardilla blanca ondulada
    box((0, 0.7, 3.7), (4.3, 1.4, 0.2), "#efeae0", bevel=0.08)
    for k in range(14):
        x = -2.05 + k * 0.315
        sph((x, yf(x, 3.6) + 0.15, 3.72), 0.26, "#f3efe6", scale=(1.0, 0.8, 0.55 + 0.25 * (k % 3 == 1)))
    # chimeneas "guerreros"
    for i, (x, y) in enumerate([(-1.7, 0.5), (-0.9, 0.9), (-0.1, 0.45), (0.7, 0.95), (1.5, 0.5), (2.0, 1.1)]):
        z = 3.9
        h = 0.9 + 0.2 * (i % 2)
        lathe([(0.24, 0), (0.17, h * 0.3), (0.2, h * 0.55), (0.14, h * 0.8), (0.19, h), (0.0, h + 0.01)],
              ("#e6dccb", "stone", {"c2": "#d4c6ad"}), loc=(x, y, z), seg=16)
        hz = z + h + 0.12
        box((x, y, hz), (0.5, 0.14, 0.24), "#e6dccb", bevel=0.05)  # casco en cruz
        box((x, y, hz), (0.14, 0.5, 0.24), "#e6dccb", bevel=0.05)
        sph((x, y, hz + 0.16), 0.11, "#e6dccb", seg=12)
        box((x, y - 0.26, hz - 0.02), (0.12, 0.02, 0.05), DARK, bevel=0)
    # torre de ventilación de trencadís
    lathe([(0.22, 0), (0.18, 0.4), (0.25, 0.7), (0.0, 1.0)],
          (["#f3f0e6", "#9fbf8a", "#c9e0b0"], "mosaic", {"scale": 14}), loc=(0.2, 1.25, 3.9))

def catedral():
    GROUND["top"] = "#ded6c6"
    st = ("#c9bfa9", "stone", {"c2": "#ada38d", "scale": 3})
    spire_m = ("#bfb59e", "stone", {"c2": "#a89e86"})
    box((0, 0.5, 1.8), (3.0, 1.6, 3.6), st)                # fachada
    box((0, 1.9, 1.6), (2.4, 1.6, 3.2), st)                # nave
    # frontón triangular con pináculos
    prism([(-1.5, 0), (1.5, 0), (0, 1.3)], 0.3, st, loc=(0, -0.2, 3.6))
    for x in (-1.2, -0.6, 0.6, 1.2):
        zz = 3.6 + 1.3 * (1 - abs(x) / 1.5)
        pinnacle(x, -0.2, zz - 0.1, 0.07, 0.55, spire_m)
    # portal gótico abocinado con arquivoltas
    for k, (w, h) in enumerate([(1.3, 2.6), (1.1, 2.35), (0.9, 2.1)]):
        opening(0, -0.32 + k * 0.03, 0, w, h, ["#a39983", "#8e846e", DARK][k])
    pinnacle(0, -0.35, 2.55, 0.25, 0.9, st)
    # rosetón y ventanales
    cyl((0, -0.32, 3.15), 0.32, 0.06, "#7a6f5d", rot=(math.pi / 2, 0, 0), verts=24)
    cyl((0, -0.36, 3.15), 0.24, 0.04, ("#3d6fa3", "glass"), rot=(math.pi / 2, 0, 0), verts=24)
    # dos torres laterales con agujas caladas
    for sx in (-1, 1):
        x = sx * 1.75
        cyl((x, 0.4, 2.3), 0.5, 4.6, st, verts=8, smooth=False)
        for z in (1.6, 2.8, 3.8):
            opening(x, -0.08, z, 0.2, 0.6, DARK)
        cyl((x, 0.4, 4.65), 0.56, 0.12, st, verts=8, smooth=False)
        for a in range(8):
            ang = a * math.pi / 4 + math.pi / 8
            pinnacle(x + 0.5 * math.cos(ang), 0.4 + 0.5 * math.sin(ang), 4.7, 0.05, 0.4, spire_m)
        cone((x, 0.4, 5.7), 0.38, 0.0, 2.0, spire_m, verts=8, smooth=False)
        sph((x, 0.4, 6.75), 0.07, GOLD, seg=12)
        # nervios de la aguja
        for a in range(4):
            ang = a * math.pi / 2
            for t in (0.25, 0.5, 0.75):
                sph((x + 0.38 * (1 - t) * math.cos(ang), 0.4 + 0.38 * (1 - t) * math.sin(ang), 4.7 + 2.0 * t),
                    0.035, spire_m, seg=8)
    # cimborrio central con aguja más alta
    cyl((0, 1.6, 4.3), 0.5, 1.6, st, verts=8, smooth=False)
    for a in range(8):
        ang = a * math.pi / 4 + math.pi / 8
        pinnacle(0.5 * math.cos(ang), 1.6 + 0.5 * math.sin(ang), 5.1, 0.05, 0.45, spire_m)
    cone((0, 1.6, 6.4), 0.42, 0.0, 2.6, spire_m, verts=8, smooth=False)
    sph((0, 1.6, 7.75), 0.1, GOLD, seg=12)
    # ventanas laterales
    for x in (-0.9, 0.9):
        opening(x, -0.32, 1.0, 0.35, 1.3, DARK)

def palau():
    GROUND["top"] = "#ddd6c8"
    colm = (["#e4573d", "#f2c744", "#5db060", "#3da5c9", "#f3f0e6", "#e88a3a"], "mosaic", {"scale": 16, "grout": 0.06})
    band = (["#3f9c83", "#f2c744", "#e4573d", "#3d6fb0", "#5db060"], "mosaic", {"scale": 10, "grout": 0.05})
    trim = "#efe3c9"
    # bloque de ladrillo rojo
    box((0, 0, 1.75), (4.0, 2.4, 3.5), BRICK, bevel=0.03)
    # planta baja: grandes arcos
    for x in (-1.1, 0.0, 1.1):
        opening(x, -1.22, 0.0, 0.8, 1.25, "#3b2c25", kind="round")
    box((0, -1.25, 1.42), (4.04, 0.16, 0.14), trim)
    # piso principal: columnas de mosaico floral delante de vidrieras
    for x in (-1.35, -0.45, 0.45, 1.35):
        opening(x, -1.22, 1.55, 0.6, 1.2, ("#3d7f9f", "glass"), kind="round")
    for x in (-1.8, -0.9, 0.0, 0.9, 1.8):
        cyl((x, -1.42, 2.15), 0.14, 1.2, colm, verts=20)
        cyl((x, -1.42, 2.8), 0.2, 0.12, trim, verts=16)
        cyl((x, -1.42, 1.5), 0.18, 0.1, trim, verts=16)
    box((0, -1.42, 2.92), (4.0, 0.36, 0.12), trim)
    # friso de mosaico y cornisa
    box((0, -1.22, 3.2), (4.04, 0.1, 0.42), band, bevel=0.01)
    box((-2.02, 0, 3.2), (0.1, 2.44, 0.42), band, bevel=0.01)
    box((0, 0, 3.52), (4.15, 2.55, 0.12), trim)
    box((0, 0.1, 3.6), (3.9, 2.2, 0.06), ("#b9573a", "brick", {"c2": "#a64a31", "mortar": "#8c3d29", "scale": 6}), bevel=0)
    # bustos sobre la cornisa
    for x in (-1.35, -0.45, 0.45, 1.35):
        cyl((x, -1.1, 3.68), 0.1, 0.2, trim, verts=12); sph((x, -1.1, 3.88), 0.12, "#f1ece3")
    # grupo escultórico de la esquina (La cançó popular catalana)
    cx, cy = -2.05, -1.25
    cyl((cx, cy, 1.6), 0.28, 0.12, trim, verts=16)
    sph((cx - 0.1, cy - 0.1, 2.15), 0.3, "#f6f2ea", scale=(0.9, 0.9, 1.7))
    sph((cx - 0.1, cy - 0.1, 2.75), 0.14, "#f6f2ea")
    box((cx - 0.05, cy - 0.15, 2.55), (0.1, 0.1, 0.7), "#f6f2ea", rot=(0.5, -0.5, 0))
    sph((cx + 0.2, cy - 0.12, 1.95), 0.18, "#f6f2ea", scale=(0.9, 0.9, 1.4))
    # cúpula de vidriera de colores (claraboya) en la azotea
    lathe([(0.75, 0), (0.72, 0.25), (0.55, 0.55), (0.3, 0.75), (0.0, 0.82)],
          (["#f2c744", "#e88a3a", "#3da5c9", "#e4573d", "#f3f0e6"], "mosaic", {"scale": 8, "grout": 0.05}),
          loc=(0.5, 0.3, 3.58))
    cyl((0.5, 0.3, 4.5), 0.04, 0.3, GOLD, verts=8)
    sph((0.5, 0.3, 4.7), 0.08, GOLD, seg=12)
    # fachada lateral
    for y in (-0.5, 0.5):
        opening(-2.01, y, 0.2, 0.45, 1.0, "#3b2c25", kind="round", rotz=math.pi / 2)
        opening(-2.01, y, 1.6, 0.45, 1.1, ("#3d7f9f", "glass"), kind="round", rotz=math.pi / 2)

def star_pts(R, n=4, inner=0.55, rot=math.pi / 4):
    pts = []
    for i in range(2 * n):
        r = R if i % 2 == 0 else R * inner
        a = rot + math.pi * i / n
        pts.append((r * math.cos(a), r * math.sin(a)))
    return pts

def montjuic():
    GROUND["top"] = GRASS
    # colina
    lathe([(2.9, 0), (2.8, 0.25), (2.4, 0.6), (1.9, 0.8), (0.0, 0.85)], ("#78b35a", "stone", {"c2": "#679d4c"}), seg=40)
    for a in (0.3, 1.9, 3.6, 4.6):
        sph((2.3 * math.cos(a), 2.3 * math.sin(a), 0.4), 0.25, "#4f8f45", seg=12)
        sph((2.0 * math.cos(a + 0.3), 2.0 * math.sin(a + 0.3), 0.55), 0.2, "#5fa04f", seg=12)
    wall = ("#d7cbb0", "stone", {"c2": "#bfb294", "scale": 3})
    # foso y muralla en estrella (baluartes)
    plan_prism(star_pts(2.25, 4, 0.62), 0.8, 0.86, "#8a7a5c")
    plan_prism(star_pts(2.05, 4, 0.62), 0.8, 1.55, wall, bevel=0.04)
    plan_prism(star_pts(1.85, 4, 0.62), 1.55, 1.6, "#a7c98a", bevel=0.0)
    # patio de armas y cuerpo principal
    box((0, 0, 1.95), (1.8, 1.8, 0.8), wall)
    for i in range(7):
        for sx, sy, rx in ((1, 0, 0), (0, 1, 1)):
            d = -0.9 + i * 0.3
            for s in (-1, 1):
                if rx: box((d, s * 0.92, 2.42), (0.15, 0.12, 0.15), wall, bevel=0.01)
                else: box((s * 0.92, d, 2.42), (0.12, 0.15, 0.15), wall, bevel=0.01)
    for x in (-0.5, 0.0, 0.5):
        opening(x, -0.92, 1.65, 0.18, 0.4, DARK, kind="round")
    # torre del homenaje / vigía
    box((0.45, 0.35, 2.85), (0.7, 0.7, 1.4), wall)
    for i in range(4):
        for s in (-1, 1):
            d = -0.27 + i * 0.18
            box((0.45 + d, 0.35 + s * 0.33, 3.63), (0.1, 0.08, 0.14), wall, bevel=0.01)
            box((0.45 + s * 0.33, 0.35 + d, 3.63), (0.08, 0.1, 0.14), wall, bevel=0.01)
    opening(0.45, -0.01, 2.8, 0.16, 0.35, DARK, kind="round")
    # puerta y puente
    opening(-0.05, -1.68, 0.86, 0.35, 0.5, DARK, kind="round", rotz=0)
    # garitas en las puntas de los baluartes
    for (px, py) in star_pts(2.05, 4, 0.62)[0::2]:
        x, y = px * 0.93, py * 0.93
        cyl((x, y, 1.75), 0.12, 0.4, wall, verts=12)
        cone((x, y, 2.05), 0.15, 0.0, 0.22, "#b86a4a", verts=12)
    # mástil y senyera
    cyl((0.45, 0.35, 4.3), 0.025, 1.4, "#555555", verts=8)
    for k in range(9):
        box((0.85, 0.35, 4.85 - k * 0.055), (0.75, 0.03, 0.055), "#f2c230" if k % 2 == 0 else "#d8352a", bevel=0.0)
    # cañones
    for x in (-1.2, 1.2):
        cyl((x, -1.15, 1.65), 0.05, 0.4, "#3a3a3a", rot=(math.pi / 2 - 0.2, 0, 0), verts=10)

def santpau():
    GROUND["top"] = "#e2d6bf"
    stone = ("#efe3c9", "stone", {"c2": "#e0d1b2"})
    tiles = (["#2f8f8a", "#f2c744", "#3a6db0", "#4fae7a"], "mosaic", {"scale": 9, "grout": 0.05, "mortar": "#e8dcc2"})
    tiles2 = (["#3a6db0", "#f2c744", "#e88a3a", "#2f8f8a"], "mosaic", {"scale": 9, "grout": 0.05, "mortar": "#e8dcc2"})
    # pabellón de administración: cuerpo largo de ladrillo
    box((0, 0.3, 1.0), (4.6, 1.4, 2.0), BRICK)
    box((0, -0.42, 2.05), (4.66, 0.1, 0.12), stone)
    box((0, -0.42, 0.1), (4.66, 0.1, 0.2), stone)
    for x in (-1.9, -1.4, -0.9, 0.9, 1.4, 1.9):
        opening(x, -0.42, 0.35, 0.28, 0.7, "#34404a", kind="round")
        opening(x, -0.42, 1.25, 0.28, 0.6, "#34404a", kind="round")
    # tejados de teja vidriada a cuatro aguas
    for sx in (-1, 1):
        prism([(-1.2, 0), (1.2, 0), (0.6, 0.6), (-0.6, 0.6)], 1.4, tiles, loc=(sx * 1.3, 0.3, 2.1))
    # torre central con reloj y aguja
    box((0, 0.1, 2.0), (1.1, 1.0, 4.0), BRICK)
    for z in (0.0, 2.3):
        opening(0, -0.42, z, 0.55, 1.4 if z == 0 else 0.8, "#34404a", kind="round")
    cyl((0, -0.42, 3.55), 0.28, 0.06, "#f6f1e6", rot=(math.pi / 2, 0, 0), verts=24)
    box((0, -0.46, 3.6), (0.03, 0.02, 0.2), DARK, bevel=0); box((0.06, -0.46, 3.55), (0.12, 0.02, 0.03), DARK, bevel=0)
    for sx in (-1, 1):
        for sy in (-1, 1):
            pinnacle(sx * 0.5, 0.1 + sy * 0.45, 4.0, 0.09, 0.6, tiles2)
    lathe([(0.48, 0), (0.45, 0.3), (0.35, 0.8), (0.2, 1.4), (0.06, 1.9), (0.0, 2.0)], tiles2, loc=(0, 0.1, 4.0), seg=8, smooth=False)
    cyl((0, 0.1, 6.15), 0.02, 0.3, GOLD, verts=6); sph((0, 0.1, 6.32), 0.06, GOLD, seg=10)
    # torres laterales con cúpula
    for sx in (-1, 1):
        x = sx * 2.25
        cyl((x, 0.0, 1.4), 0.36, 2.8, BRICK, verts=8, smooth=False)
        cyl((x, 0.0, 2.85), 0.4, 0.1, stone, verts=8, smooth=False)
        lathe([(0.38, 0), (0.36, 0.25), (0.25, 0.55), (0.1, 0.75), (0.0, 0.8)], tiles, loc=(x, 0.0, 2.9), seg=24)
        cyl((x, 0.0, 3.85), 0.02, 0.25, GOLD, verts=6)
    # jardín
    for x in (-1.6, 1.6):
        tree(x, -1.3, 0, 0.8, "round", "#5f9e4f")
    tree(-0.7, -1.4, 0, 0.9, "palm", "#4f9a4a")
    tree(0.75, -1.4, 0, 0.9, "palm", "#4f9a4a")

def glories():
    GROUND["top"] = "#c9dbe6"
    H = 6.2
    prof = []
    for t in range(0, 21):
        z = H * 0.68 * t / 20
        prof.append((1.15 + 0.06 * math.sin(math.pi * t / 20), z))
    for t in range(1, 15):
        a = (math.pi / 2) * t / 14
        prof.append((1.15 * math.cos(a), H * 0.68 + H * 0.32 * math.sin(a)))
    prof.append((0.0, H))
    lathe(prof, (["#d63b2f", "#e8692f", "#f2a03a", "#5aa0d8", "#2e5fb0", "#9fd0f0"], "glories", {"z0": 0.3, "z1": H}),
          seg=64)
    # piel exterior de vidrio (lamas) apenas insinuada
    o = lathe([(p[0] * 1.03 + 0.01, p[1]) for p in prof[:-1]] + [(0.0, H * 1.005)],
              ("#ffffff", "plain", {"rough": 0.05}), seg=64)
    b = o.active_material.node_tree.nodes["Principled BSDF"]
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Alpha"].default_value = 0.25
    # puntos de luz (LED)
    import random
    random.seed(7)
    for i in range(70):
        z = random.uniform(0.6, H * 0.9)
        r = next(p[0] for p in prof if p[1] >= z) * 1.01
        a = random.uniform(-math.pi * 0.95, 0.05)
        sph((r * math.cos(a), r * math.sin(a), z), 0.035, ("#fff6d0", "glow", {"strength": 3}), seg=8)
    # plaza: estanque y árboles
    cyl((0, 0, 0.03), 1.6, 0.06, "#bfc8cc", verts=48)
    for x, y in ((-1.9, -0.9), (1.9, -0.7), (-1.6, 1.3), (1.7, 1.3)):
        tree(x, y, 0, 0.8)

def boqueria():
    GROUND["top"] = "#e2d6bf"
    iron = ("#3c5b52", "plain", {"rough": 0.35, "metal": 0.6})
    # nave del mercado con cubierta metálica
    box((0, 1.0, 0.9), (4.4, 2.0, 1.8), ("#e8dcc4", "stone", {}))
    prism([(-2.3, 0), (2.3, 0), (1.6, 0.7), (-1.6, 0.7)], 2.2, ("#7f9a8c", "brick", {"c2": "#6f8b7c", "mortar": "#5d7568", "scale": 4}), loc=(0, 1.0, 1.8))
    # pilares y arco de hierro de la entrada
    for sx in (-1, 1):
        box((sx * 1.15, -0.1, 1.3), (0.28, 0.28, 2.6), iron)
        sph((sx * 1.15, -0.1, 2.72), 0.13, iron)
    n = 24
    pts_o = [(1.3 * math.cos(math.pi * i / n), 2.55 + 0.95 * math.sin(math.pi * i / n)) for i in range(n + 1)]
    pts_i = [(0.95 * math.cos(math.pi * i / n), 2.55 + 0.65 * math.sin(math.pi * i / n)) for i in range(n, -1, -1)]
    prism(pts_o + pts_i, 0.22, iron, loc=(0, -0.1, 0))
    # vidriera de colores dentro del arco
    glass = (["#e4573d", "#f2c744", "#3da5c9", "#5db060", "#e88a3a"], "mosaic", {"scale": 9, "grout": 0.12, "mortar": "#2f4a42"})
    prism([(0.95 * math.cos(math.pi * i / n), 2.55 + 0.65 * math.sin(math.pi * i / n)) for i in range(n + 1)], 0.08, glass,
          loc=(0, -0.1, 0))
    # letrero
    box((0, -0.24, 2.3), (2.2, 0.08, 0.38), "#f2ead6", bevel=0.02)
    bpy.ops.object.text_add(location=(0, -0.29, 2.23), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.object; t.data.body = "BOQUERIA"; t.data.align_x = "CENTER"; t.data.size = 0.3
    t.data.extrude = 0.02
    t.data.materials.append(M("#b4312a"))
    # escudo
    cyl((0, -0.24, 3.05), 0.22, 0.06, (["#f2c744", "#d8352a"], "mosaic", {"scale": 12}), rot=(math.pi / 2, 0, 0))
    # entrada oscura
    opening(0, -0.02, 0, 2.0, 2.1, "#3a2f28", kind="rect")
    # puestos de fruta
    fruits = ["#e4473a", "#f2c744", "#6cbf4a", "#f08a2a", "#9b3fa0", "#e4473a"]
    for i, x in enumerate((-1.85, -1.15, 1.15, 1.85)):
        box((x, -0.95, 0.3), (0.62, 0.7, 0.6), "#8a6440", bevel=0.03)
        box((x, -0.95, 1.1), (0.7, 0.8, 0.06), ["#e4573d", "#3da5c9", "#5db060", "#f2c744"][i], rot=(0.25, 0, 0))
        for p in (-0.22, 0.22): cyl((x + p, -1.25, 0.85), 0.02, 0.5, "#5a4a3a", verts=6)
        for r in range(3):
            for k in range(3):
                sph((x - 0.18 + k * 0.18, -1.2 + r * 0.17, 0.66 + r * 0.06), 0.085, fruits[(i + r + k) % 6], seg=12)
    # caja de frutas centrales
    for k in range(5):
        sph((-0.4 + k * 0.2, -1.3, 0.12), 0.1, fruits[k], seg=12)

def tibidabo():
    GROUND["top"] = GRASS
    lathe([(2.9, 0), (2.7, 0.4), (2.1, 1.1), (1.3, 1.55), (0.0, 1.7)], ("#6fae55", "stone", {"c2": "#5a9447"}), seg=40)
    for a in (0.2, 1.1, 2.4, 3.3, 4.2, 5.4):
        tree(2.2 * math.cos(a), 2.2 * math.sin(a), 0.45, 0.6, "round", "#4f8f45")
    base = 1.6
    crypt = ("#a88a6a", "stone", {"c2": "#94785a"})
    white = ("#ece6da", "stone", {"c2": "#d9d0c0"})
    # cripta románica (piedra oscura) con escalinata
    box((0, 0.1, base + 0.55), (2.2, 1.6, 1.1), crypt)
    for x in (-0.6, 0, 0.6):
        opening(x, -0.72, base + 0.1, 0.38, 0.75, DARK, kind="round")
    for k in range(4):
        box((0, -0.85 - k * 0.12, base - 0.05 + (3 - k) * 0.08), (1.4, 0.14, 0.16), crypt, bevel=0.01)
    # iglesia neogótica
    box((0, 0.15, base + 1.6), (1.7, 1.3, 1.0), white)
    for x in (-0.45, 0.45):
        opening(x, -0.52, base + 1.25, 0.25, 0.65, DARK)
    for sx in (-1, 1):
        for sy in (-1, 1):
            x, y = sx * 0.85, 0.15 + sy * 0.65
            cyl((x, y, base + 1.9), 0.18, 1.6, white, verts=8, smooth=False)
            cone((x, y, base + 3.0), 0.2, 0.0, 0.6, white, verts=8, smooth=False)
            sph((x, y, base + 3.33), 0.06, "#c99a3a", seg=10)
    # torre central con aguja
    cyl((0, 0.15, base + 2.6), 0.5, 1.6, white, verts=8, smooth=False)
    for a in range(8):
        ang = a * math.pi / 4 + math.pi / 8
        opening(0.47 * math.cos(ang), 0.15 + 0.47 * math.sin(ang), base + 2.4, 0.13, 0.55, DARK,
                rotz=ang + math.pi / 2)
    cone((0, 0.15, base + 3.9), 0.42, 0.12, 1.0, white, verts=8, smooth=False)
    # estatua del Sagrado Corazón (brazos abiertos)
    bronze = ("#d1a646", "plain", {"rough": 0.3, "metal": 0.7})
    sz = base + 4.4
    cyl((0, 0.15, sz), 0.13, 0.08, bronze, verts=12)
    cone((0, 0.15, sz + 0.35), 0.17, 0.08, 0.6, bronze, verts=16)
    sph((0, 0.15, sz + 0.75), 0.09, bronze, seg=16)
    for sx in (-1, 1):
        box((sx * 0.2, 0.15, sz + 0.55), (0.32, 0.07, 0.07), bronze, rot=(0, sx * 0.55, 0), bevel=0.02)
    # noria del parque de atracciones
    wx, wy, wz = 1.7, 0.9, base + 0.9
    torus((wx, wy, wz), 0.75, 0.03, "#d8402f", rot=(math.pi / 2, 0, 0.3))
    for k in range(8):
        a = k * math.pi / 4
        dx, dz = 0.75 * math.cos(a), 0.75 * math.sin(a)
        box((wx + dx / 2 * math.cos(0.3), wy + dx / 2 * math.sin(0.3), wz + dz / 2), (0.75, 0.02, 0.02), "#f3f0e6",
            rot=(0, -a, 0.3), bevel=0)
        sph((wx + dx * math.cos(0.3), wy + dx * math.sin(0.3) - 0.05, wz + dz - 0.08), 0.09,
            ["#f2c744", "#3da5c9", "#e4573d", "#5db060"][k % 4], seg=12)
    for sx in (-1, 1):
        box((wx + sx * 0.25 * math.cos(0.3), wy + sx * 0.25 * math.sin(0.3), wz - 0.45), (0.04, 0.04, 1.0), "#f3f0e6",
            rot=(0, sx * 0.4, 0.3), bevel=0)

def pedralbes():
    GROUND["top"] = "#d9cfb8"
    st = ("#e2d3b4", "stone", {"c2": "#cfbe9a"})
    roof = ("#c06a45", "brick", {"c2": "#ad5b3a", "mortar": "#8f4a30", "scale": 14})
    S, T, H1 = 2.1, 0.5, 0.95          # mitad del claustro, ancho galería, altura planta
    # jardín central con fuente y árboles
    g = S - T
    box((0, 0, 0.06), (2 * g, 2 * g, 0.12), "#7fb860", bevel=0.02)
    for a in (0, math.pi / 2):
        box((0, 0, 0.13), (2 * g * abs(math.cos(a)) + 0.25, 2 * g * abs(math.sin(a)) + 0.25, 0.03), "#e6dcc6", bevel=0)
    cyl((0, 0, 0.22), 0.25, 0.2, st, verts=8, smooth=False)
    sph((0, 0, 0.36), 0.1, ("#7ec0e8", "glass"), seg=12)
    tree(-0.75, -0.7, 0.1, 1.2, "cypress", "#3f7d45"); tree(0.75, 0.7, 0.1, 1.2, "cypress", "#3f7d45")
    tree(0.7, -0.7, 0.1, 1.0, "palm", "#4f9a4a"); tree(-0.75, 0.7, 0.1, 0.8, "round", "#5f9e4f")

    def wing(side, floors):
        rz = side * math.pi / 2
        c, s = math.cos(rz), math.sin(rz)
        def P(u, v): return (u * c - v * s, u * s + v * c)
        along_x = side % 2 == 0
        def sz(a, b, h): return (a, b, h) if along_x else (b, a, h)
        Ht = floors * H1
        if floors > 1:  # muro exterior
            cx, cy = P(0, S - 0.08)
            box((cx, cy, Ht / 2), sz(2 * S, 0.16, Ht), st, bevel=0.02)
        nb = 7
        for f in range(floors):
            z0 = f * H1
            h = H1 * (0.85 if f < 2 else 0.6)
            # banda de muro de la galería con arcos apuntados oscuros
            cx, cy = P(0, g)
            box((cx, cy, z0 + H1 - 0.06), sz(2 * g + 0.1, 0.14, 0.12), st, bevel=0.01)
            for k in range(nb):
                u = -g + (k + 0.5) * 2 * g / nb
                w = 2 * g / nb
                x, y = P(u, g + 0.03)
                opening(x, y, z0 + 0.08, w * 0.78, h, ("#4e4036", "plain"), kind="pointed", rotz=rz, d=0.03)
            for k in range(nb + 1):
                u = -g + k * 2 * g / nb
                x, y = P(u, g - 0.02)
                cyl((x, y, z0 + 0.08 + h * 0.5), 0.04, h, "#f1e7d2", verts=8)
                cyl((x, y, z0 + 0.08 + h), 0.07, 0.06, "#f1e7d2", verts=8)
            # forjado y pretil
            cx, cy = P(0, S - T / 2)
            box((cx, cy, z0 + 0.04), sz(2 * S, T + 0.05, 0.08), st, bevel=0.01)
        # tejado de teja inclinado hacia el patio
        verts = [P(-S - 0.05, S + 0.05) + (Ht + 0.4,), P(S + 0.05, S + 0.05) + (Ht + 0.4,),
                 P(g - 0.05, g - 0.12) + (Ht + 0.02,), P(-(g - 0.05), g - 0.12) + (Ht + 0.02,)]
        mesh_obj("teja", verts, [(0, 1, 2, 3)], roof).modifiers.new("s", "SOLIDIFY").thickness = 0.08

    wing(0, 3); wing(1, 3)            # alas del fondo: tres pisos de arcadas
    wing(2, 1); wing(3, 1)            # alas delanteras bajas para ver el patio
    # campanario octogonal en la esquina del fondo
    bx, by = -S + 0.35, S - 0.35
    cyl((bx, by, 2.7), 0.45, 5.4, st, verts=8, smooth=False)
    for a in range(8):
        ang = a * math.pi / 4 + math.pi / 8
        opening(0.42 * math.cos(ang) + bx, 0.42 * math.sin(ang) + by, 4.3, 0.17, 0.6, DARK, rotz=ang + math.pi / 2)
    cyl((bx, by, 5.45), 0.52, 0.1, st, verts=8, smooth=False)
    for a in range(8):
        ang = a * math.pi / 4 + math.pi / 8
        pinnacle(bx + 0.46 * math.cos(ang), by + 0.46 * math.sin(ang), 5.5, 0.05, 0.32, st)
    cone((bx, by, 5.85), 0.34, 0.0, 0.7, roof, verts=8, smooth=False)

MODELS = dict(sagrada=sagrada, guell=guell, batllo=batllo, pedrera=pedrera, catedral=catedral, palau=palau,
              montjuic=montjuic, santpau=santpau, glories=glories, boqueria=boqueria, tibidabo=tibidabo,
              pedralbes=pedralbes)

# ------------------------------------------------------------------ escena y cámara
CAM_DIR = Vector((0.5, -1.0, 0.52)).normalized()

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _MATS.clear()

def all_points():
    pts = []
    dg = bpy.context.evaluated_depsgraph_get()
    for o in bpy.context.scene.objects:
        if o.type not in ("MESH", "FONT"): continue
        ev = o.evaluated_get(dg)
        try: me = ev.to_mesh()
        except RuntimeError: continue
        mw = o.matrix_world
        pts += [mw @ v.co for v in me.vertices]
        ev.to_mesh_clear()
    return pts

def render(name):
    reset()
    GROUND["top"] = "#e8dcc6"
    MODELS[name]()
    pts = all_points()
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), 0))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    c = (lo + hi) / 2
    # peana redonda de dos capas (común a todos)
    R = max(math.hypot(p.x - c.x, p.y - c.y) for p in pts if p.z < 1.0) + 0.35
    R = max(R, 2.4)
    cyl((c.x, c.y, -0.06), R, 0.12, (GROUND["top"], "stone", {"c2": GROUND["top"], "scale": 2}), verts=96, bevel=0.04)
    cyl((c.x, c.y, -0.32), R + 0.12, 0.4, ("#8a6a4f", "stone", {"c2": "#7a5c43"}), verts=96, bevel=0.08)

    scn = bpy.context.scene
    scn.render.engine = "CYCLES"
    scn.cycles.device = "CPU"
    scn.cycles.samples = SAMPLES
    scn.cycles.use_denoising = True
    scn.cycles.max_bounces = 6
    scn.render.resolution_x = scn.render.resolution_y = 512
    scn.render.film_transparent = True
    scn.render.image_settings.file_format = "PNG"
    scn.render.image_settings.color_mode = "RGBA"
    scn.render.image_settings.compression = 100
    for vt, look in (("AgX", "AgX - Medium High Contrast"), ("Filmic", "Medium High Contrast")):
        try:
            scn.view_settings.view_transform = vt
            try: scn.view_settings.look = look
            except TypeError: pass
            break
        except TypeError:
            continue

    w = bpy.data.worlds.new("w"); scn.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.78, 0.86, 1.0, 1); bg.inputs[1].default_value = 0.55

    sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 4.2; sun.angle = math.radians(18)
    sun.color = (1.0, 0.9, 0.76)
    so = bpy.data.objects.new("sun", sun); scn.collection.objects.link(so)
    so.rotation_euler = (math.radians(48), 0, math.radians(-28))
    fill = bpy.data.lights.new("fill", "AREA"); fill.energy = 900; fill.size = 12; fill.color = (0.85, 0.9, 1.0)
    fo = bpy.data.objects.new("fill", fill); scn.collection.objects.link(fo)
    fo.location = c + Vector((-12, -8, 6)); fo.rotation_euler = (-(fo.location - c)).to_track_quat("-Z", "Y").to_euler()

    cam = bpy.data.cameras.new("cam"); cam.type = "ORTHO"
    co = bpy.data.objects.new("cam", cam); scn.collection.objects.link(co)
    scn.camera = co
    rot = (-CAM_DIR).to_track_quat("-Z", "Y")
    right = rot @ Vector((1, 0, 0)); up = rot @ Vector((0, 1, 0))
    pts = all_points()
    us = [p.dot(right) for p in pts]; vs = [p.dot(up) for p in pts]
    cu, cv = (min(us) + max(us)) / 2, (min(vs) + max(vs)) / 2
    span = max(max(us) - min(us), max(vs) - min(vs))
    centre_proj = right * cu + up * cv
    co.location = centre_proj + CAM_DIR * 40
    co.rotation_euler = rot.to_euler()
    cam.ortho_scale = span / 0.84
    cam.clip_end = 200
    path = os.path.join(OUT, f"{name}.png")
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)
    quantize_png(path)

# ------------------------------------------------------------------ PNG con paleta (más ligero)
def quantize_png(path, k=256, iters=8):
    img = bpy.data.images.load(path)
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[::-1]  # de arriba abajo
    bpy.data.images.remove(img)
    rgba = np.clip(px * 255 + 0.5, 0, 255).astype(np.uint8)
    a = rgba[..., 3]
    rgba[a < 6] = 0
    flat = rgba.reshape(-1, 4).astype(np.float32)
    vis = flat[flat[:, 3] > 0]
    rng = np.random.default_rng(1)
    cent = vis[rng.choice(len(vis), k - 1, replace=False)] if len(vis) >= k else vis.copy()
    sample = vis[rng.choice(len(vis), min(len(vis), 60000), replace=False)]
    for _ in range(iters):
        d = ((sample[:, None, :] - cent[None, :, :]) ** 2).sum(-1)
        lab = d.argmin(1)
        for j in range(len(cent)):
            m = sample[lab == j]
            if len(m): cent[j] = m.mean(0)
    idx = np.zeros(len(flat), dtype=np.uint8)
    on = flat[:, 3] > 0
    pv = flat[on]
    out = np.empty(len(pv), dtype=np.int64)
    for s in range(0, len(pv), 20000):
        d = ((pv[s:s + 20000, None, :] - cent[None, :, :]) ** 2).sum(-1)
        out[s:s + 20000] = d.argmin(1)
    idx[on] = (out + 1).astype(np.uint8)
    pal = np.vstack([np.zeros((1, 4)), np.clip(cent + 0.5, 0, 255)]).astype(np.uint8)
    raw = b"".join(b"\x00" + idx.reshape(h, w)[y].tobytes() for y in range(h))
    def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 3, 0, 0, 0))
    png += chunk(b"PLTE", pal[:, :3].tobytes()) + chunk(b"tRNS", pal[:, 3].tobytes())
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f: f.write(png)

os.makedirs(OUT, exist_ok=True)
for n in (ONLY or MODELS):
    render(n)
