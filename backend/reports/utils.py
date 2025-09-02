# reports/utils.py
from io import BytesIO
from pathlib import Path
from django.conf import settings
from docxtpl import DocxTemplate
from jinja2 import Environment, StrictUndefined

def _env():
    env = Environment(
        autoescape=False,
        undefined=StrictUndefined,  # 누락 키 즉시 에러(개발초기 권장)
        trim_blocks=True,
        lstrip_blocks=True,
    )
    env.filters["comma"] = lambda v: f"{float(v):,}" if v is not None else ""
    return env

def render_docx(context: dict, template_rel_path="reports/templates/report_template.docx"):
    tpl_path = Path(settings.BASE_DIR) / template_rel_path
    tpl = DocxTemplate(str(tpl_path))
    tpl.render(context, _env())
    buf = BytesIO()
    tpl.save(buf)
    buf.seek(0)
    return buf
