"""Render MediMesh Review-1 UML diagrams as PNGs."""
from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Ellipse, FancyArrowPatch, FancyBboxPatch, Rectangle
from matplotlib.lines import Line2D

OUT = Path(r"c:\Users\safee\OneDrive\Desktop\Mini Project\scripts\pptx_extract")
OUT.mkdir(parents=True, exist_ok=True)

NAVY = "#14323a"
TEAL = "#1db8a6"
FILL = "#e7f6f3"
BLUE = "#d9eefc"
INK = "#14323a"
MUTED = "#5c7480"
AMBER = "#fef3c7"
ROSE = "#fde2e4"
GOLD = "#f5d9a6"
WHITE = "#ffffff"

plt.rcParams.update({
    "font.family": "Segoe UI",
    "font.size": 10,
    "text.color": INK,
    "axes.linewidth": 0,
})


def fig(w=16.2, h=9.4):
    f, ax = plt.subplots(figsize=(w, h), dpi=160)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect("auto")
    ax.axis("off")
    f.patch.set_facecolor(WHITE)
    ax.set_facecolor(WHITE)
    return f, ax


def box(ax, x, y, w, h, text, fc=FILL, ec=NAVY, lw=1.6, size=9, weight="medium", va="center"):
    p = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.15,rounding_size=0.6",
                       facecolor=fc, edgecolor=ec, linewidth=lw, zorder=2)
    ax.add_patch(p)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va=va, fontsize=size,
            weight=weight, zorder=3, wrap=True, linespacing=1.25)
    return p


def rbox(ax, x, y, w, h, title, attrs, methods, fc=BLUE):
    p = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.35",
                       facecolor=fc, edgecolor=NAVY, linewidth=1.4, zorder=2)
    ax.add_patch(p)
    title_h = 1.35
    ax.add_line(Line2D([x + 0.4, x + w - 0.4], [y + h - title_h, y + h - title_h], color=NAVY, lw=0.8, zorder=3))
    ax.text(x + w / 2, y + h - title_h / 2, title, ha="center", va="center",
            fontsize=8.5, weight="bold", zorder=3)
    body_top = y + h - title_h
    if methods:
        split = y + h * 0.38
        ax.add_line(Line2D([x + 0.4, x + w - 0.4], [split, split], color=NAVY, lw=0.8, zorder=3))
        ax.text(x + w / 2, (split + body_top) / 2, attrs, ha="center", va="center",
                fontsize=6.6, zorder=3, linespacing=1.25)
        ax.text(x + w / 2, (y + split) / 2, methods, ha="center", va="center",
                fontsize=6.6, zorder=3, linespacing=1.25)
    else:
        ax.text(x + w / 2, (y + body_top) / 2, attrs, ha="center", va="center",
                fontsize=6.6, zorder=3, linespacing=1.25)


def arrow(ax, x1, y1, x2, y2, text="", style="-|>", ls="-", color=NAVY, lw=1.2):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, mutation_scale=12,
                                 lw=lw, color=color, linestyle=ls, zorder=4,
                                 shrinkA=0, shrinkB=0))
    if text:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 1.1, text, ha="center", va="bottom",
                fontsize=7, color=MUTED, zorder=5)


def stick(ax, x, y, label):
    ax.add_patch(Circle((x, y + 6.2), 1.15, facecolor=WHITE, edgecolor=NAVY, lw=1.5, zorder=3))
    ax.plot([x, x], [y + 5.05, y + 2.4], color=NAVY, lw=1.6, zorder=3)
    ax.plot([x - 1.6, x + 1.6], [y + 4.2, y + 4.2], color=NAVY, lw=1.6, zorder=3)
    ax.plot([x, x - 1.2], [y + 2.4, y + 0.4], color=NAVY, lw=1.6, zorder=3)
    ax.plot([x, x + 1.2], [y + 2.4, y + 0.4], color=NAVY, lw=1.6, zorder=3)
    ax.text(x, y - 1.1, label, ha="center", va="top", fontsize=9, weight="bold")


def oval(ax, x, y, w, h, text):
    e = Ellipse((x, y), w, h, facecolor=FILL, edgecolor=NAVY, lw=1.4, zorder=2)
    ax.add_patch(e)
    ax.text(x, y, text, ha="center", va="center", fontsize=7.6, zorder=3, linespacing=1.15)
    return x, y, w, h


def save(f, name):
    path = OUT / name
    f.savefig(path, bbox_inches="tight", pad_inches=0.18, facecolor=WHITE)
    plt.close(f)
    print("wrote", path)
    return path


def draw_architecture():
    f, ax = fig(16, 9.2)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect("auto")
    layers = [
        (78, "Client  React + TypeScript + Vite + Tailwind",
         "Role dashboards in one phone shell: Patient, Doctor, Nurse, Pharmacist, Reception, Admin\n"
         "Sunrise Care (Hyderabad)  |  Lotus (Vijayawada)  |  Arogya (Warangal)"),
        (56, "Application  MeshContext reducer (hospital_id isolation)",
         "Book slot + live token   |   Call next / handover / dispense   |   Dual wait (your turn vs hospital-wide)"),
        (32, "AI  explainable, not a black-box diagnosis",
         "HospitalFlow formula (FastAPI + on-device fallback)     Care Copilot (shift-aware routing)\n"
         "Care Explainer EN / HI / TE + read-aloud, doctor-approved     Mesh demand (SKU totals only)"),
        (8, "Data  stock never crosses hospitals",
         "In-memory demo seed now   |   supabase/schema.sql with RLS by hospital_id   |   QueueTicket, Treatment, Stock, Handover"),
    ]
    for y, title, body in layers:
        box(ax, 4, y, 92, 18, "", fc="#f4fbf9", lw=1.8)
        ax.text(8, y + 13.5, title, fontsize=13, weight="bold", color=NAVY, ha="left")
        ax.text(8, y + 6.5, body, fontsize=10, color=INK, ha="left", va="center", linespacing=1.45)
    for y in (76, 54, 30):
        arrow(ax, 50, y, 50, y - 5.5, color=TEAL, lw=1.8)
    ax.text(50, 97.5, "MediMesh architecture  (what the demo actually runs)", ha="center",
            fontsize=14, weight="bold")
    return save(f, "uml_architecture.png")


def draw_usecase():
    f, ax = fig(16.4, 10)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect("auto")
    sys = FancyBboxPatch((18, 8), 64, 84, boxstyle="round,pad=0.4,rounding_size=1.2",
                         facecolor=WHITE, edgecolor=NAVY, lw=2, zorder=1)
    ax.add_patch(sys)
    ax.text(50, 88.5, "MediMesh AI", ha="center", fontsize=13, weight="bold")

    stick(ax, 8, 72, "Patient")
    stick(ax, 8, 50, "Receptionist")
    stick(ax, 8, 28, "Nurse")
    stick(ax, 8, 8, "Pharmacist")
    stick(ax, 92, 66, "Doctor")
    stick(ax, 92, 28, "Administrator")

    cases = [
        (34, 76, "Book slot &\nmint live token"),
        (50, 76, "View dual wait\n(your turn / hospital)"),
        (66, 76, "Ask Care Copilot\n(not a diagnosis)"),
        (34, 60, "Read care explainer\nEN / HI / TE + voice"),
        (50, 60, "Check duty shift\n(day OPD / night)"),
        (66, 60, "Call next &\napprove explainer"),
        (34, 44, "Issue walk-in\ntoken"),
        (50, 44, "Write / sign\nday-night handover"),
        (66, 44, "Dispense Rx &\nupdate stock"),
        (34, 28, "View HospitalFlow\nvisible maths"),
        (50, 28, "View mesh demand\n(anonymised SKU)"),
        (66, 28, "Adjust staffing\n(admin sliders)"),
        (50, 14, "Emergency divert\n(no OPD booking)"),
    ]
    for x, y, t in cases:
        oval(ax, x, y, 18, 10.5, t)

    def link(x1, y1, x2, y2):
        ax.plot([x1, x2], [y1, y2], color="#7a93a0", lw=1.05, zorder=1)

    # Patient
    for x, y in ((34, 76), (50, 76), (66, 76), (34, 60), (50, 60), (50, 14)):
        link(10.2, 78, x - 9, y)
    # Receptionist
    for x, y in ((34, 76), (34, 44)):
        link(10.2, 56, x - 9, y)
    # Nurse
    link(10.2, 34, 41, 44)
    link(10.2, 34, 41, 60)
    # Pharmacist
    link(10.2, 14, 41, 28)
    link(10.2, 14, 57, 44)
    # Doctor
    for x, y in ((66, 76), (66, 60), (34, 60), (50, 76)):
        link(89.8, 72, x + 9, y)
    # Admin
    for x, y in ((66, 28), (34, 28), (50, 28)):
        link(89.8, 34, x + 9, y)

    ax.annotate("", xy=(50, 68.5), xytext=(50, 66),
                arrowprops=dict(arrowstyle="-|>", color=TEAL, lw=1.2))
    ax.text(51.5, 67.2, "<<include>>", fontsize=6.5, color=TEAL)
    ax.annotate("", xy=(50, 20.5), xytext=(66, 71),
                arrowprops=dict(arrowstyle="-|>", color="#b45309", lw=1.1, ls="--"))
    ax.text(62, 40, "<<extend>>", fontsize=6.5, color="#b45309", rotation=70)
    ax.text(50, 3.5, "Associations match the demo: Copilot includes duty-shift check; chest tightness extends to emergency (no token).",
            ha="center", fontsize=8, color=MUTED)
    return save(f, "uml_usecase.png")


def draw_class():
    f, ax = fig(16.6, 10.2)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect("auto")
    ax.text(50, 97, "Class diagram  — MediMesh domain (aligned to web/src/types.ts)",
            ha="center", fontsize=13, weight="bold")

    rbox(ax, 36, 82, 28, 14, "Hospital",
         "id  name  city  tokenPrefix\nclinicOpen/Close  doctorsOnDuty\navgConsultMinutes  occupancy",
         "nearHandover  staff sliders", "#cfeee9")

    rbox(ax, 4, 58, 22, 16, "Person",
         "id  hospitalId  role\nshift  specialty  available",
         "login()  toggleDuty()")
    rbox(ax, 28, 58, 22, 16, "Patient",
         "id  hospitalId  condition\nbp  hr  bloodGroup  language",
         "")
    rbox(ax, 52, 58, 22, 16, "QueueTicket",
         "token  department  status\nurgent  doctorId  source",
         "waiting | with-doctor\npharmacy | done")
    rbox(ax, 76, 58, 20, 16, "Appointment",
         "dateLabel  time\nstatus  token  ticketId",
         "upcoming | done")

    rbox(ax, 4, 32, 22, 16, "Treatment",
         "happening  medicineDoes\nrecoverBy  glossary  lang",
         "approve()  readAloud()")
    rbox(ax, 28, 32, 22, 16, "Prescription",
         "medicine  dose  status",
         "pending | ready | dispensed")
    rbox(ax, 52, 32, 22, 16, "StockItem",
         "sku  quantity  reorderAt\nsoldWeek  hospitalId",
         "in | low | out")
    rbox(ax, 76, 32, 20, 16, "Handover",
         "shift  watchlist  medsDue\nstaffingNote  signed",
         "sign()")

    rbox(ax, 10, 6, 36, 18, "HospitalFlow",
         "waiting × consult ÷ doctors\n+ pharmacy + stock-outs\n× staff × handover × crowd",
         "predict()  p50 / p80\nFastAPI or on-device", GOLD)
    rbox(ax, 54, 6, 36, 18, "CareCopilot",
         "symptoms + dutyShift\nnightNurse  clinicOpen",
         "routeCare()  → routine |\nnight-hold | emergency", "#ead9f7")

    def assoc(x1, y1, x2, y2, a="1", b="*", dx=0, dy=0.8):
        ax.plot([x1, x2], [y1, y2], color=NAVY, lw=1.05, zorder=1)
        ax.text(x1 + dx, y1 + dy, a, fontsize=6.5, color=MUTED)
        ax.text(x2 - 1.2, y2 + dy, b, fontsize=6.5, color=MUTED)

    assoc(50, 82, 15, 74, "1", "*")
    assoc(50, 82, 39, 74, "1", "*")
    assoc(50, 82, 63, 74, "1", "*")
    assoc(26, 58, 39, 58, "0..1", "1")
    assoc(50, 58, 50, 48, "1", "*")
    assoc(39, 58, 63, 48)
    assoc(15, 58, 15, 48)
    assoc(39, 32, 63, 32)
    ax.plot([28, 28], [24, 18], color=NAVY, lw=1.05, ls="--")
    ax.plot([72, 72], [24, 18], color=NAVY, lw=1.05, ls="--")
    ax.text(30, 20, "<<uses queue + stock>>", fontsize=6.5, color=MUTED)
    ax.text(74, 20, "<<uses Person + shift>>", fontsize=6.5, color=MUTED)
    ax.text(50, 1.6, "StockItem is scoped by hospitalId — mesh demand sums soldWeek by SKU and never reads another hospital’s quantity.",
            ha="center", fontsize=8, color=MUTED)
    return save(f, "uml_class.png")


def draw_sequence():
    f, ax = fig(16.4, 10)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect("auto")
    ax.text(50, 97, "Sequence  — Confirm appointment issues a live token and dual wait",
            ha="center", fontsize=13, weight="bold")

    actors = [("Patient", 10), ("BookPage", 30), ("MeshContext", 52), ("Queue + Flow", 74), ("FastAPI", 92)]
    for name, x in actors:
        box(ax, x - 8, 88, 16, 6, name, fc=BLUE, size=8, weight="bold")
        ax.plot([x, x], [88, 8], color="#b7c9d1", lw=1.1, ls="--", zorder=1)

    steps = [
        (82, 10, 30, "pick date, time, Dr. Meera"),
        (77, 30, 52, "book-slot(today, issueToken=true)"),
        (72, 52, 74, "mint next token S-16, status=waiting"),
        (67, 74, 52, "ticket S-16 assigned to GP"),
        (62, 52, 74, "dualWait(patient, day shift)"),
        (57, 74, 92, "POST /api/flow  (optional)"),
        (52, 92, 74, "predictedMinutes + consult step"),
        (47, 74, 52, "yourTurn=9, hospitalWide=30"),
        (42, 52, 30, "token + both waits"),
        (37, 30, 10, "show Token issued  S-16"),
        (30, 10, 30, "later: doctor Call next"),
        (25, 30, 52, "call-next(urgent, then this GP)"),
        (20, 52, 74, "S-16 waiting -> with-doctor"),
        (15, 74, 52, "peopleAhead drops, wait recalculated"),
        (10, 52, 10, "Home: your turn updates live"),
    ]
    for y, x1, x2, label in steps:
        style = "<|-" if (x2 < x1) else "-|>"
        ax.add_patch(FancyArrowPatch((x1, y), (x2, y), arrowstyle=style, mutation_scale=11,
                                     lw=1.15, color=NAVY, zorder=4,
                                     linestyle="--" if x2 < x1 else "-"))
        ax.text((x1 + x2) / 2, y + 1.45, label, ha="center", fontsize=7, color=INK)
    ax.text(50, 4, "Night duty: issueToken=false — slot is held until clinicOpen; Copilot routes to the night nurse instead of minting an OPD token.",
            ha="center", fontsize=8, color=MUTED)
    return save(f, "uml_sequence.png")


def draw_activity():
    f, ax = fig(15.2, 10.4)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect("auto")
    ax.text(50, 97.5, "Activity  — from symptoms to token (Care Copilot + booking)",
            ha="center", fontsize=13, weight="bold")

    ax.add_patch(Circle((50, 93), 1.05, facecolor=NAVY, zorder=3))

    def node(x, y, w, h, t, fc=FILL):
        box(ax, x - w / 2, y - h / 2, w, h, t, fc=fc, size=8)
        return x, y

    def diamond(x, y, t):
        xs = [x, x + 9, x, x - 9]
        ys = [y + 4.6, y, y - 4.6, y]
        ax.fill(xs, ys, facecolor=AMBER, edgecolor=NAVY, lw=1.4, zorder=2)
        ax.text(x, y, t, ha="center", va="center", fontsize=7.4, zorder=3)
        return x, y

    node(50, 87, 28, 6, "Patient opens MediMesh\n(select hospital + role)")
    arrow(ax, 50, 84, 50, 80.5)
    node(50, 77, 30, 6, "Ask Care Copilot\nmatch words to this shift")
    arrow(ax, 50, 74, 50, 70.2)
    diamond(50, 65.5, "Emergency\nchest tightness?")
    arrow(ax, 59, 65.5, 78, 65.5)
    node(86, 65.5, 22, 7, "Casualty now\nDO NOT book OPD", ROSE)
    arrow(ax, 50, 61, 50, 57.2)
    diamond(50, 52.5, "Day OPD\nopen?")
    arrow(ax, 41, 52.5, 22, 52.5)
    node(14, 52.5, 22, 8, "Night nurse on duty\nHold morning slot\nNo live token yet", BLUE)
    arrow(ax, 50, 48, 50, 43.5)
    node(50, 40, 30, 6, "Confirm appointment\nmint live token (e.g. S-16)")
    arrow(ax, 50, 37, 50, 32.8)
    node(50, 29.5, 32, 6, "Show dual wait\nYour turn  3×12÷4 = 9 min\nHospital-wide includes pharmacy")
    arrow(ax, 50, 26.5, 50, 22.5)
    node(50, 19.5, 28, 6, "Doctor Call next → with-doctor\nApprove explainer → pharmacy")
    arrow(ax, 50, 16.5, 50, 12.2)
    diamond(50, 7.8, "Stock\nin?")
    arrow(ax, 59, 7.8, 74, 7.8)
    node(86, 7.8, 20, 6, "Dispense &\nmark done", FILL)
    arrow(ax, 41, 7.8, 26, 7.8)
    node(14, 7.8, 22, 6, "Mark OUT\nflag mesh demand", AMBER)
    ax.add_patch(Circle((50, 1.6), 1.3, facecolor=WHITE, edgecolor=NAVY, lw=1.6, zorder=3))
    ax.add_patch(Circle((50, 1.6), 0.55, facecolor=NAVY, zorder=4))
    ax.plot([86, 86, 50], [62, 1.6, 1.6], color=NAVY, lw=1.1)
    ax.plot([14, 14, 50], [48.5, 1.6, 1.6], color=NAVY, lw=1.1)
    ax.plot([86, 86, 50], [4.8, 1.6, 1.6], color=NAVY, lw=1.1)
    ax.plot([14, 14, 50], [4.8, 1.6, 1.6], color=NAVY, lw=1.1)
    ax.text(68, 67.2, "yes", fontsize=7, color=MUTED)
    ax.text(45.5, 58.5, "no", fontsize=7, color=MUTED)
    ax.text(32, 54.2, "no", fontsize=7, color=MUTED)
    ax.text(45.5, 46, "yes", fontsize=7, color=MUTED)
    ax.text(64, 9.5, "yes", fontsize=7, color=MUTED)
    ax.text(34, 9.5, "no", fontsize=7, color=MUTED)
    return save(f, "uml_activity.png")


def draw_state():
    f, ax = fig(16.2, 8.8)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect("auto")
    ax.text(50, 95, "State chart  — live OPD token (QueueTicket)",
            ha="center", fontsize=14, weight="bold")
    ax.add_patch(Circle((8, 62), 1.4, facecolor=NAVY, zorder=3))

    states = [
        (22, 62, "Waiting", "Token minted\nS-16 in OPD queue\nDual wait shown", FILL),
        (48, 62, "With doctor", "Call next\nExplainer can be\napproved here", BLUE),
        (74, 62, "Pharmacy", "Rx pending\nStock in / low / out", GOLD),
        (48, 22, "Done", "Visit closed\nToken no longer waits", "#dcefe3"),
    ]
    for x, y, title, body, fc in states:
        box(ax, x - 11, y - 10, 22, 20, "", fc=fc, lw=1.7)
        ax.text(x, y + 5.2, title, ha="center", fontsize=11, weight="bold")
        ax.text(x, y - 1.5, body, ha="center", fontsize=8, linespacing=1.25)

    box(ax, 4, 18, 20, 14, "Held\n(night / future)", fc=ROSE, size=9)
    arrow(ax, 9.6, 62, 11, 62)
    ax.text(12, 64.5, "Confirm &\nget token", fontsize=7.2, color=MUTED)
    arrow(ax, 33, 62, 37, 62)
    ax.text(35, 65.2, "call-next", fontsize=7.5, color=MUTED, ha="center")
    arrow(ax, 59, 62, 63, 62)
    ax.text(61, 65.2, "send-pharmacy", fontsize=7.5, color=MUTED, ha="center")
    arrow(ax, 74, 52, 59, 32)
    ax.text(72, 40, "dispense", fontsize=7.5, color=MUTED)
    arrow(ax, 48, 52, 48, 32)
    ax.text(50.5, 42, "cleared\n(no Rx)", fontsize=7.5, color=MUTED)
    arrow(ax, 24, 25, 37, 22)
    ax.text(28, 28.5, "clinic opens", fontsize=7.2, color=MUTED)
    ax.annotate("", xy=(22, 52), xytext=(22, 32),
                arrowprops=dict(arrowstyle="-|>", color=NAVY, lw=1.2))
    ax.text(10, 42, "recalculate\nyour turn", fontsize=7.2, color=MUTED, ha="left")
    ax.add_patch(Circle((90, 22), 1.7, facecolor=WHITE, edgecolor=NAVY, lw=1.7, zorder=3))
    ax.add_patch(Circle((90, 22), 0.7, facecolor=NAVY, zorder=4))
    arrow(ax, 59, 22, 88.2, 22)
    ax.text(50, 4, "Appointment.upcoming is only a calendar hold. The token state machine above is what updates wait time on Home.",
            ha="center", fontsize=8.5, color=MUTED)
    return save(f, "uml_state.png")


if __name__ == "__main__":
    draw_architecture()
    draw_usecase()
    draw_class()
    draw_sequence()
    draw_activity()
    draw_state()
