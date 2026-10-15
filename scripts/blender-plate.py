"""Zino's plate builder layers. Run: python plate.py OUTDIR [samples]
Renders aligned transparent PNGs from one camera:
  plate.png, rice-small.png, rice-big.png, chicken.png, fish.png, beef.png, plantain.png, coleslaw.png
"""
import bpy, bmesh, math, random, sys
from mathutils import Vector, Matrix

OUT = sys.argv[1]
SAMPLES = int(sys.argv[2]) if len(sys.argv) > 2 else 64
RES = int(__import__("os").environ.get("RES", 900))
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x = sc.render.resolution_y = RES
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Medium High Contrast"

# ------------------------------------------------------------------ helpers
def mat(name, color, rough=0.5, sss=0.0, spec=0.5, coat=0.0, noise=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Subsurface Radius"].default_value = (0.4, 0.15, 0.05)
    b.inputs["Coat Weight"].default_value = coat
    if noise:
        # per-object colour variation via object random
        info = nt.nodes.new("ShaderNodeObjectInfo")
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].color = (*noise[0], 1)
        ramp.color_ramp.elements[1].color = (*noise[1], 1)
        nt.links.new(info.outputs["Random"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    return m

def tex_noise_mat(name, c1, c2, scale=8, rough=0.45, coat=0.3, bump=0.4):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale; n.inputs["Detail"].default_value = 8
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (*c1, 1); r.color_ramp.elements[1].color = (*c2, 1)
    r.color_ramp.elements[0].position = 0.35; r.color_ramp.elements[1].position = 0.7
    nt.links.new(n.outputs["Fac"], r.inputs["Fac"]); nt.links.new(r.outputs["Color"], b.inputs["Base Color"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump
    nt.links.new(n.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Subsurface Weight"].default_value = 0.15
    return m

def bumpy(o, strength):
    t = bpy.data.textures.new(o.name + "n", "CLOUDS"); t.noise_scale = 0.12
    m = o.modifiers.new("disp", "DISPLACE"); m.texture = t; m.strength = strength

def link(o, coll):
    for c in o.users_collection: c.objects.unlink(o)
    coll.objects.link(o)

colls = {}
def coll(name):
    c = bpy.data.collections.new(name); sc.collection.children.link(c); colls[name] = c; return c

def smooth(o):
    for p in o.data.polygons: p.use_smooth = True

# ------------------------------------------------------------------ plate
cp = coll("plate")
prof = [(0, 0), (1.55, 0), (1.62, 0.04), (1.72, 0.10), (2.05, 0.22), (2.12, 0.25), (2.14, 0.22), (2.06, 0.17), (1.72, 0.06), (0, 0.04)]
bm = bmesh.new()
verts = [bm.verts.new((x, 0, z)) for x, z in prof]
for a, b in zip(verts, verts[1:]): bm.edges.new((a, b))
bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], angle=math.tau, steps=96, axis=(0, 0, 1), cent=(0, 0, 0))
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
me = bpy.data.meshes.new("plate"); bm.to_mesh(me); bm.free()
plate = bpy.data.objects.new("plate", me); cp.objects.link(plate); smooth(plate)
plate.modifiers.new("sub", "SUBSURF").levels = 2
plate.data.materials.append(mat("ceramic", (0.8, 0.79, 0.77), rough=0.12, coat=0.6))

# ------------------------------------------------------------------ rice
grain = bpy.data.meshes.new("grain")
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=6, radius=1)
bmesh.ops.scale(bm, vec=(0.055, 0.019, 0.019), verts=bm.verts)
bm.to_mesh(grain); bm.free()
for p in grain.polygons: p.use_smooth = True
rice_mat = mat("rice", (0.5, 0.1, 0.02), rough=0.3, sss=0.1, coat=0.35,
               noise=((0.42, 0.06, 0.01), (0.62, 0.16, 0.02)))
grain.materials.append(rice_mat)
green = mat("pepper", (0.12, 0.35, 0.05), rough=0.3, coat=0.4)
red = mat("tomato", (0.6, 0.04, 0.02), rough=0.3, coat=0.4)

RICE_SHADES = [mat(f"rice{i}", c, rough=0.3, sss=0.1, coat=0.35) for i, c in enumerate(
    [(0.42, 0.06, 0.01), (0.5, 0.1, 0.015), (0.58, 0.13, 0.02), (0.64, 0.18, 0.03)])]

def grains_mesh(name, placements, scale, mats, segs=(8, 6)):
    """One mesh holding every grain: far faster than thousands of objects."""
    proto = bmesh.new()
    bmesh.ops.create_uvsphere(proto, u_segments=segs[0], v_segments=segs[1], radius=1)
    bmesh.ops.scale(proto, vec=scale, verts=proto.verts)
    pv = [v.co.copy() for v in proto.verts]
    pf = [[v.index for v in f.verts] for f in proto.faces]
    proto.free()
    verts, faces, mi = [], [], []
    for loc, rot, s, m in placements:
        R = rot.to_matrix() * s
        base = len(verts)
        verts.extend(R @ v + loc for v in pv)
        faces.extend([base + i for i in f] for f in pf)
        mi.extend([m] * len(pf))
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    me.polygons.foreach_set("material_index", mi)
    me.polygons.foreach_set("use_smooth", [True] * len(faces))
    for m in mats: me.materials.append(m)
    return bpy.data.objects.new(name, me)

from mathutils import Euler
def rice_mound(name, R, H, n):
    c = coll(name)
    pl = []
    for i in range(n):
        r = R * math.sqrt(random.random())
        th = random.uniform(0, math.tau)
        x, y = r * math.cos(th), r * math.sin(th)
        zt = H * max(0, 1 - (r / R) ** 2) ** 0.8
        z = 0.06 + zt - random.uniform(0, 0.08)
        rot = Euler((random.uniform(-0.6, 0.6), random.uniform(-0.6, 0.6), random.uniform(0, math.tau)))
        pl.append((Vector((x, y, z)), rot, random.uniform(0.85, 1.15), random.randrange(4)))
    c.objects.link(grains_mesh(name + "-g", pl, (0.055, 0.019, 0.019), RICE_SHADES))
    bits = []
    for i in range(int(n / 220)):
        r = R * 0.85 * math.sqrt(random.random()); th = random.uniform(0, math.tau)
        z = 0.08 + H * max(0, 1 - (r / R) ** 2) ** 0.8
        bits.append((Vector((r * math.cos(th), r * math.sin(th), z)), Euler((random.random(), random.random(), random.random())), 1, i % 2))
    c.objects.link(grains_mesh(name + "-b", bits, (0.04, 0.04, 0.03), [green, red], (6, 4)))

rice_mound("rice-small", 1.05, 0.42, 4200)
rice_mound("rice-big", 1.42, 0.6, 8500)

# ------------------------------------------------------------------ chicken drumstick
cc = coll("chicken")
crust = tex_noise_mat("fried", (0.13, 0.03, 0.005), (0.42, 0.13, 0.02), scale=14, bump=1.0, coat=0.25)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.42, location=(0, 0, 0))
d = bpy.context.object; d.scale = (1.0, 0.62, 0.52)
bpy.ops.mesh.primitive_cylinder_add(radius=0.11, depth=0.75, location=(0.62, 0, 0), rotation=(0, math.pi / 2, 0))
bone = bpy.context.object
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.13, location=(1.0, 0.0, 0))
knob = bpy.context.object
for o in (d, bone): smooth(o)
d.data.materials.append(crust); bone.data.materials.append(crust)
knob.data.materials.append(mat("bone", (0.86, 0.78, 0.62), rough=0.4)); smooth(knob)
bpy.ops.object.select_all(action="DESELECT")
for o in (d, bone, knob): o.select_set(True)
bpy.context.view_layer.objects.active = d
bpy.ops.object.join(); chick = bpy.context.object
chick.modifiers.new("sub", "SUBSURF").levels = 2
bumpy(chick, 0.06)
chick.location = (-0.85, 0.75, 0.62); chick.rotation_euler = (0.25, -0.2, math.radians(-35))
link(chick, cc)

# ------------------------------------------------------------------ fried fish (body)
cf = coll("fish")
fish_m = tex_noise_mat("fishskin", (0.12, 0.03, 0.01), (0.45, 0.1, 0.02), scale=20, bump=0.6, coat=0.25)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, segments=48, ring_count=24)
f = bpy.context.object; f.scale = (2.0, 0.55, 0.32); smooth(f)
bpy.ops.object.transform_apply(scale=True)
# tail
bpy.ops.mesh.primitive_cone_add(radius1=0.3, depth=0.45, vertices=24, location=(-1.0, 0, 0), rotation=(0, math.pi / 2, 0))
t = bpy.context.object; t.scale = (0.3, 1, 1); smooth(t)
for o in (f, t): o.data.materials.append(fish_m)
bpy.ops.object.select_all(action="DESELECT"); f.select_set(True); t.select_set(True)
bpy.context.view_layer.objects.active = f; bpy.ops.object.join(); fish = bpy.context.object
bumpy(fish, 0.04)
fish.location = (-0.55, 0.95, 0.62); fish.rotation_euler = (0.2, -0.1, math.radians(-25))
link(fish, cf)

# ------------------------------------------------------------------ beef chunks
cb = coll("beef")
beef_m = tex_noise_mat("beef", (0.18, 0.05, 0.02), (0.45, 0.12, 0.04), scale=18, bump=0.9, coat=0.6)
for i, (x, y) in enumerate([(-1.0, 0.65), (-0.6, 1.0), (-1.15, 1.05)]):
    bpy.ops.mesh.primitive_cube_add(size=0.45, location=(x, y, 0.6 - 0.05 * i), rotation=(random.random() * 0.5, random.random() * 0.5, random.random() * 3))
    o = bpy.context.object; o.scale = (1.1, 0.9, 0.7)
    o.modifiers.new("b", "BEVEL").width = 0.08
    o.modifiers.new("s", "SUBSURF").levels = 2
    o.data.materials.append(beef_m); smooth(o); link(o, cb)

# ------------------------------------------------------------------ plantain (dodo) slices
cpl = coll("plantain")
dodo = bpy.data.materials.new("dodo"); dodo.use_nodes = True
nt = dodo.node_tree; b = nt.nodes["Principled BSDF"]
geo = nt.nodes.new("ShaderNodeNewGeometry")
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(geo.outputs["Normal"], sep.inputs["Vector"])
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.12, 0.03, 0.005, 1)  # caramel edge
ramp.color_ramp.elements[1].color = (0.8, 0.38, 0.05, 1)  # golden centre
ramp.color_ramp.elements[0].position = 0.55
nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 9; nz.inputs["Detail"].default_value = 6
spots = nt.nodes.new("ShaderNodeValToRGB")
spots.color_ramp.elements[0].position = 0.5; spots.color_ramp.elements[1].position = 0.62
spots.color_ramp.elements[0].color = (0, 0, 0, 1); spots.color_ramp.elements[1].color = (1, 1, 1, 1)
nt.links.new(nz.outputs["Fac"], spots.inputs["Fac"])
mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
mix.inputs["B"].default_value = (0.2, 0.05, 0.008, 1)
nt.links.new(spots.outputs["Color"], mix.inputs["Factor"])
nt.links.new(ramp.outputs["Color"], mix.inputs["A"]); nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
bp2 = nt.nodes.new("ShaderNodeBump"); bp2.inputs["Strength"].default_value = 0.5
nt.links.new(nz.outputs["Fac"], bp2.inputs["Height"]); nt.links.new(bp2.outputs["Normal"], b.inputs["Normal"])
b.inputs["Roughness"].default_value = 0.4; b.inputs["Coat Weight"].default_value = 0.35
b.inputs["Subsurface Weight"].default_value = 0.2
for i in range(7):
    a = math.radians(-60 + i * 22)
    x, y = 1.05 + 0.15 * math.cos(a * 2), 0.2 + 0.85 * math.sin(a)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=0.13, vertices=40, location=(x, y, 0.5 + 0.03 * i), rotation=(0.35, 0.2, a))
    o = bpy.context.object; o.scale = (1.35, 1, 1)
    o.modifiers.new("b", "BEVEL").width = 0.05; o.modifiers["b"].segments = 3
    o.data.materials.append(dodo); smooth(o); link(o, cpl)

# ------------------------------------------------------------------ coleslaw
ccs = coll("coleslaw")
cab = mat("cabbage", (0.78, 0.85, 0.6), rough=0.35, sss=0.4, coat=0.3)
car = mat("carrot", (0.95, 0.38, 0.05), rough=0.35, coat=0.3)
sl = []
for i in range(520):
    r = 0.5 * math.sqrt(random.random()); th = random.uniform(0, math.tau)
    x, y = 0.55 + r * math.cos(th), -1.05 + r * math.sin(th) * 0.8
    z = 0.32 + 0.3 * (1 - (r / 0.5) ** 2) + random.uniform(0, 0.05)
    sl.append((Vector((x, y, z)), Euler((random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5), random.uniform(0, math.tau))), 1, 1 if i % 6 == 0 else 0))
ccs.objects.link(grains_mesh("slaw", sl, (0.11, 0.012, 0.006), [cab, car], (6, 4)))

# ------------------------------------------------------------------ light & camera
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (1.0, 0.93, 0.88, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.25
def area(loc, energy, size, color=(1, 0.95, 0.88)):
    l = bpy.data.lights.new("a", "AREA"); l.energy = energy; l.size = size; l.color = color
    o = bpy.data.objects.new("a", l); o.location = loc; sc.collection.objects.link(o)
    o.rotation_euler = (Vector((0, 0, 0.3)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
area((-4, -3, 6), 520, 3)
area((4, 2, 3), 160, 2, (1, 0.85, 0.75))
area((0, 5, 2), 180, 2)

cam = bpy.data.cameras.new("c"); cam.lens = 58
co = bpy.data.objects.new("c", cam); sc.collection.objects.link(co); sc.camera = co
co.location = (0, -5.4, 6.0)
co.rotation_euler = (Vector((0, 0.05, 0.2)) - co.location).to_track_quat("-Z", "Y").to_euler()

# ------------------------------------------------------------------ render layers
# Each layer renders alone; everything else is a shadow-casting holdout so the
# layer gets correct occlusion against the plate/rice but stays transparent.
LAYERS = {
    "plate": ["plate"],
    "rice-small": ["rice-small"],
    "rice-big": ["rice-big"],
    "chicken": ["chicken"], "fish": ["fish"], "beef": ["beef"],
    "plantain": ["plantain"], "coleslaw": ["coleslaw"],
}
vl = sc.view_layers[0]
only = sys.argv[3].split(",") if len(sys.argv) > 3 else list(LAYERS)
for name in only:
    show = LAYERS[name]
    base = ["plate", "rice-big"] if name not in ("plate", "rice-small", "rice-big") else ["plate"] if name != "plate" else []
    for cname, c in colls.items():
        lc = vl.layer_collection.children[cname]
        lc.exclude = not (cname in show or cname in base)
        lc.holdout = cname in base and cname not in show
    sc.render.filepath = f"{OUT}/{name}.png"
    bpy.ops.render.render(write_still=True)
    print("rendered", name, flush=True)
