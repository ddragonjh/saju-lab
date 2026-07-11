$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$source = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.IO;

public static class StoreAssetGenerator
{
    static readonly Color Navy = Color.FromArgb(255, 7, 10, 24);
    static readonly Color Deep = Color.FromArgb(255, 19, 17, 43);
    static readonly Color Violet = Color.FromArgb(255, 94, 73, 176);
    static readonly Color Gold = Color.FromArgb(255, 226, 191, 108);
    static readonly Color Gold2 = Color.FromArgb(255, 190, 146, 67);
    static readonly Color Ink = Color.FromArgb(255, 248, 242, 224);
    static readonly Color Muted = Color.FromArgb(255, 190, 185, 210);

    static readonly string AppName = "\uC6B4\uBA85\uC5F0\uAD6C\uC18C";
    static readonly string ServiceLine = "\uC0AC\uC8FC \u00B7 \uD0C0\uB85C \u00B7 \uC2E0\uC810 \u00B7 \uBCC4\uC790\uB9AC";
    static readonly string TodayLine = "\uC624\uB298\uC758 \uD750\uB984\uC744 \uAC00\uBC8D\uAC8C \uD655\uC778\uD558\uC138\uC694";
    static readonly string Saju = "\uC0AC\uC8FC";
    static readonly string Tarot = "\uD0C0\uB85C";
    static readonly string Oracle = "\uC2E0\uC810";
    static readonly string Zodiac = "\uBCC4\uC790\uB9AC";
    static readonly string Fortune = "\uC624\uB298\uC758 \uC6B4\uC138";
    static readonly string SelfCare = "\uC624\uB77D\u00B7\uC790\uAE30\uC774\uD574\uC6A9 \uCC38\uACE0 \uCF58\uD150\uCE20";

    public static void Generate(string outputDir)
    {
        Directory.CreateDirectory(outputDir);
        DrawSquare(Path.Combine(outputDir, "app-photo-600x600.png"));
        DrawThumbnail(Path.Combine(outputDir, "thumbnail-1932x828.png"));
    }

    static GraphicsPath RoundRect(RectangleF r, float radius)
    {
        var path = new GraphicsPath();
        float d = radius * 2;
        path.AddArc(r.X, r.Y, d, d, 180, 90);
        path.AddArc(r.Right - d, r.Y, d, d, 270, 90);
        path.AddArc(r.Right - d, r.Bottom - d, d, d, 0, 90);
        path.AddArc(r.X, r.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }

    static void FillRound(Graphics g, Brush brush, RectangleF r, float radius)
    {
        using (var p = RoundRect(r, radius)) g.FillPath(brush, p);
    }

    static void StrokeRound(Graphics g, Pen pen, RectangleF r, float radius)
    {
        using (var p = RoundRect(r, radius)) g.DrawPath(pen, p);
    }

    static Font Font(float size, FontStyle style = FontStyle.Regular)
    {
        return new Font("Malgun Gothic", size, style, GraphicsUnit.Pixel);
    }

    static void Text(Graphics g, string text, Font font, Brush brush, RectangleF rect, StringAlignment align = StringAlignment.Near, StringAlignment line = StringAlignment.Near)
    {
        using (var sf = new StringFormat())
        {
            sf.Alignment = align;
            sf.LineAlignment = line;
            sf.Trimming = StringTrimming.EllipsisCharacter;
            g.DrawString(text, font, brush, rect, sf);
        }
    }

    static void Setup(Graphics g)
    {
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        g.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
    }

    static void Background(Graphics g, int w, int h)
    {
        using (var b = new LinearGradientBrush(new Rectangle(0, 0, w, h), Navy, Deep, 70f))
        {
            g.FillRectangle(b, 0, 0, w, h);
        }
        using (var b = new SolidBrush(Color.FromArgb(38, 132, 99, 220)))
        {
            g.FillEllipse(b, -w / 7, -h / 5, w / 2, h / 2);
            g.FillEllipse(b, w - w / 3, h / 8, w / 2, h / 2);
        }
        using (var p = new Pen(Color.FromArgb(80, Gold), 2))
        {
            g.DrawEllipse(p, w - h / 2, -h / 4, h / 2, h / 2);
            g.DrawEllipse(p, -h / 4, h - h / 2, h / 2, h / 2);
        }
        var rnd = new Random(47 + w + h);
        for (int i = 0; i < 120; i++)
        {
            int x = rnd.Next(0, w);
            int y = rnd.Next(0, h);
            int a = rnd.Next(55, 150);
            using (var b = new SolidBrush(Color.FromArgb(a, Ink)))
            {
                float s = rnd.Next(1, 4);
                g.FillEllipse(b, x, y, s, s);
            }
        }
    }

    static void DrawCompass(Graphics g, float cx, float cy, float r)
    {
        using (var p1 = new Pen(Color.FromArgb(150, Gold), 3))
        using (var p2 = new Pen(Color.FromArgb(70, Gold), 1))
        {
            g.DrawEllipse(p1, cx - r, cy - r, r * 2, r * 2);
            g.DrawEllipse(p2, cx - r * .72f, cy - r * .72f, r * 1.44f, r * 1.44f);
            for (int i = 0; i < 24; i++)
            {
                double a = Math.PI * 2 * i / 24.0;
                float x1 = cx + (float)Math.Cos(a) * r * .78f;
                float y1 = cy + (float)Math.Sin(a) * r * .78f;
                float x2 = cx + (float)Math.Cos(a) * r * .94f;
                float y2 = cy + (float)Math.Sin(a) * r * .94f;
                g.DrawLine(i % 3 == 0 ? p1 : p2, x1, y1, x2, y2);
            }
        }
        PointF[] star = new PointF[8];
        for (int i = 0; i < 8; i++)
        {
            double a = -Math.PI / 2 + Math.PI * 2 * i / 8.0;
            float rr = i % 2 == 0 ? r * .62f : r * .22f;
            star[i] = new PointF(cx + (float)Math.Cos(a) * rr, cy + (float)Math.Sin(a) * rr);
        }
        using (var b = new SolidBrush(Color.FromArgb(210, Gold)))
        using (var p = new Pen(Color.FromArgb(220, Ink), 1.5f))
        {
            g.FillPolygon(b, star);
            g.DrawPolygon(p, star);
        }
    }

    static void DrawOrbitMark(Graphics g, float cx, float cy, float r)
    {
        using (var glow = new SolidBrush(Color.FromArgb(34, Gold)))
        {
            g.FillEllipse(glow, cx - r * 1.45f, cy - r * 1.45f, r * 2.9f, r * 2.9f);
        }
        DrawCompass(g, cx, cy, r);
        using (var p = new Pen(Color.FromArgb(96, Ink), 1.4f))
        {
            g.DrawEllipse(p, cx - r * 1.23f, cy - r * .42f, r * 2.46f, r * .84f);
            g.DrawEllipse(p, cx - r * .42f, cy - r * 1.23f, r * .84f, r * 2.46f);
        }
        using (var b = new SolidBrush(Color.FromArgb(235, Ink)))
        using (var f = Font(r * .52f, FontStyle.Bold))
        {
            Text(g, "\u904B", f, b, new RectangleF(cx - r, cy - r * .58f, r * 2, r * 1.12f), StringAlignment.Center, StringAlignment.Center);
        }
    }

    static void Chip(Graphics g, string label, float x, float y, float w)
    {
        var r = new RectangleF(x, y, w, 46);
        using (var b = new SolidBrush(Color.FromArgb(28, 255, 255, 255)))
        using (var p = new Pen(Color.FromArgb(95, Gold), 1))
        using (var f = Font(18, FontStyle.Bold))
        {
            FillRound(g, b, r, 20);
            StrokeRound(g, p, r, 20);
            Text(g, label, f, new SolidBrush(Ink), r, StringAlignment.Center, StringAlignment.Center);
        }
    }

    static void MiniCard(Graphics g, string title, string body, RectangleF r, Color accent)
    {
        using (var b = new SolidBrush(Color.FromArgb(230, 22, 24, 45)))
        using (var p = new Pen(Color.FromArgb(70, 255, 255, 255), 1))
        {
            FillRound(g, b, r, 18);
            StrokeRound(g, p, r, 18);
        }
        using (var b = new SolidBrush(accent))
        {
            FillRound(g, b, new RectangleF(r.X + 18, r.Y + 18, 52, 52), 16);
        }
        using (var f1 = Font(24, FontStyle.Bold))
        using (var f2 = Font(17))
        {
            Text(g, title, f1, new SolidBrush(Ink), new RectangleF(r.X + 84, r.Y + 18, r.Width - 104, 30));
            Text(g, body, f2, new SolidBrush(Muted), new RectangleF(r.X + 84, r.Y + 52, r.Width - 104, 48));
        }
    }

    static void FeatureCard(Graphics g, string title, string body, string mark, RectangleF r, Color accent)
    {
        using (var b = new LinearGradientBrush(r, Color.FromArgb(236, 24, 27, 48), Color.FromArgb(222, 12, 15, 31), 110f))
        using (var p = new Pen(Color.FromArgb(72, 226, 191, 108), 1.3f))
        {
            FillRound(g, b, r, 24);
            StrokeRound(g, p, r, 24);
        }
        using (var b = new SolidBrush(Color.FromArgb(220, accent)))
        {
            FillRound(g, b, new RectangleF(r.X + 24, r.Y + 26, 70, 70), 22);
        }
        using (var f0 = Font(34, FontStyle.Bold))
        using (var f1 = Font(34, FontStyle.Bold))
        using (var f2 = Font(22))
        {
            Text(g, mark, f0, new SolidBrush(Color.FromArgb(245, 9, 11, 20)), new RectangleF(r.X + 24, r.Y + 25, 70, 70), StringAlignment.Center, StringAlignment.Center);
            Text(g, title, f1, new SolidBrush(Ink), new RectangleF(r.X + 116, r.Y + 28, r.Width - 146, 42));
            Text(g, body, f2, new SolidBrush(Muted), new RectangleF(r.X + 116, r.Y + 77, r.Width - 146, 58));
        }
    }

    static void Phone(Graphics g, RectangleF r, string title, string mode)
    {
        using (var shadow = new SolidBrush(Color.FromArgb(95, 0, 0, 0)))
            FillRound(g, shadow, new RectangleF(r.X + 18, r.Y + 24, r.Width, r.Height), 42);
        using (var shell = new SolidBrush(Color.FromArgb(255, 15, 18, 35)))
        using (var line = new Pen(Color.FromArgb(115, Gold), 2))
        {
            FillRound(g, shell, r, 42);
            StrokeRound(g, line, r, 42);
        }
        using (var screen = new SolidBrush(Color.FromArgb(255, 10, 12, 25)))
            FillRound(g, screen, new RectangleF(r.X + 16, r.Y + 18, r.Width - 32, r.Height - 36), 32);

        using (var f1 = Font(23, FontStyle.Bold))
        using (var f2 = Font(15))
        {
            Text(g, title, f1, new SolidBrush(Ink), new RectangleF(r.X + 34, r.Y + 44, r.Width - 68, 32), StringAlignment.Center);
            Text(g, mode, f2, new SolidBrush(Muted), new RectangleF(r.X + 34, r.Y + 78, r.Width - 68, 24), StringAlignment.Center);
        }

        float y = r.Y + 126;
        MiniCard(g, Saju, "\uC624\uD589\u00B7\uC2ED\uC131\u00B7\uB300\uC6B4", new RectangleF(r.X + 34, y, r.Width - 68, 112), Color.FromArgb(210, Gold2));
        MiniCard(g, Tarot, "\uC0AC\uC6A9\uC790\uAC00 \uACE0\uB974\uB294 3\uC7A5", new RectangleF(r.X + 34, y + 132, r.Width - 68, 112), Color.FromArgb(210, Violet));
        string fortuneTitle = r.Width < 300 ? "\uC6B4\uC138" : Fortune;
        MiniCard(g, fortuneTitle, "\uC624\uB298\u00B7\uC774\uC8FC\u00B7\uC774\uB2EC", new RectangleF(r.X + 34, y + 264, r.Width - 68, 112), Color.FromArgb(210, 55, 155, 175));
    }

    static void DrawSquare(string path)
    {
        using (var bmp = new Bitmap(600, 600, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(bmp))
        {
            Setup(g);
            Background(g, 600, 600);
            using (var veil = new SolidBrush(Color.FromArgb(84, 0, 0, 0)))
                g.FillRectangle(veil, 0, 0, 600, 600);
            DrawOrbitMark(g, 300, 228, 132);

            using (var f1 = Font(56, FontStyle.Bold))
            using (var f2 = Font(24, FontStyle.Bold))
            {
                Text(g, AppName, f1, new SolidBrush(Ink), new RectangleF(0, 400, 600, 74), StringAlignment.Center, StringAlignment.Center);
                Text(g, ServiceLine, f2, new SolidBrush(Gold), new RectangleF(0, 480, 600, 40), StringAlignment.Center, StringAlignment.Center);
            }
            bmp.Save(path, ImageFormat.Png);
        }
    }

    static void DrawThumbnail(string path)
    {
        using (var bmp = new Bitmap(1932, 828, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(bmp))
        {
            Setup(g);
            Background(g, 1932, 828);

            using (var veil = new SolidBrush(Color.FromArgb(42, 0, 0, 0)))
                g.FillRectangle(veil, 0, 0, 1932, 828);
            using (var halo = new SolidBrush(Color.FromArgb(34, Gold)))
                g.FillEllipse(halo, 1188, -132, 690, 690);
            DrawOrbitMark(g, 1588, 256, 154);

            using (var f1 = Font(112, FontStyle.Bold))
            using (var f2 = Font(42, FontStyle.Bold))
            using (var f3 = Font(34))
            using (var f4 = Font(26))
            {
                Text(g, AppName, f1, new SolidBrush(Ink), new RectangleF(120, 150, 760, 132));
                Text(g, ServiceLine, f2, new SolidBrush(Gold), new RectangleF(128, 300, 820, 62));
                Text(g, TodayLine, f3, new SolidBrush(Muted), new RectangleF(128, 390, 760, 54));
                Text(g, SelfCare, f4, new SolidBrush(Color.FromArgb(218, Ink)), new RectangleF(130, 658, 850, 42));
            }

            FeatureCard(g, Saju, "\uC624\uD589\u00B7\uC2ED\uC131\u00B7\uB300\uC6B4", "\u56DB", new RectangleF(1042, 436, 360, 148), Color.FromArgb(255, 190, 146, 67));
            FeatureCard(g, Tarot, "\uC9C1\uC811 \uACE0\uB974\uB294 3\uC7A5", "\u2726", new RectangleF(1440, 436, 360, 148), Color.FromArgb(255, 100, 77, 190));
            FeatureCard(g, Oracle, "\uC624\uB298 \uD544\uC694\uD55C \uD55C\uB9C8\uB514", "\u25C7", new RectangleF(1042, 612, 360, 148), Color.FromArgb(255, 61, 148, 162));
            FeatureCard(g, Zodiac, "\uBCC4\uC790\uB9AC \uC6B4\uC138", "\u2606", new RectangleF(1440, 612, 360, 148), Color.FromArgb(255, 201, 168, 106));
            bmp.Save(path, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $source -ReferencedAssemblies System.Drawing

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$outDir = Join-Path $repoRoot "assets\appintoss"
[StoreAssetGenerator]::Generate($outDir)

Get-ChildItem -Path $outDir -Filter *.png | Select-Object FullName, Length
