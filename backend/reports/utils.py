from docxtpl import DocxTemplate
from jinja2 import Environment
from io import BytesIO

def _env():
    env = Environment(autoescape=False)
    env.filters["comma"] = lambda v: f"{float(v):,.2f}" if v is not None else ""
    env.filters["intcomma"] = lambda v: f"{int(float(v)):,}" if v is not None else ""
    env.filters["pct"] = lambda v: (f"{float(v)*100:.1f}%" if v is not None else "")
    return env

def render_docx(template_path: str, context: dict) -> BytesIO:
    tpl = DocxTemplate(template_path)
    tpl.render(context, _env())
    buf = BytesIO()
    tpl.save(buf)
    buf.seek(0)
    return buf
